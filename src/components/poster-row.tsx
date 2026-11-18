'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

// px per second the shelf drifts on its own
const SPEED = 28
// how long the drift waits after someone scrolls, swipes or clicks an arrow
const RESUME_MS = 2500

function Arrow({ dir, onClick }: { dir: -1 | 1; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={dir < 0 ? 'Scroll left' : 'Scroll right'}
            className={`absolute top-[38%] z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--rd-border)] bg-[var(--rd-bg)] text-[var(--rd-text)] opacity-0 shadow-[0_6px_16px_-6px_rgb(0_0_0_/_0.35)] transition-opacity duration-200 hover:bg-[var(--rd-surface-2)] focus-visible:opacity-100 group-hover/row:opacity-100 md:flex ${
                dir < 0 ? 'left-1' : 'right-1'
            }`}
        >
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
            >
                <path d={dir < 0 ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
            </svg>
        </button>
    )
}

// PosterRow — a shelf of posters inside the page column that drifts on its
// own, looping forever. `ghost` is a second, id-free copy of the items that
// makes the loop seamless; it's only mounted when the row is wider than its
// column (a short row just sits still). Hover, focus or touch pauses the
// drift, and the row still scrolls by hand or with the arrows.
export function PosterRow({
    id,
    title,
    meta,
    children,
    ghost,
    reverse = false,
    lang,
}: {
    id?: string
    title: ReactNode
    meta?: ReactNode
    children: ReactNode
    ghost?: ReactNode
    /** Drift right-to-left instead of left-to-right. */
    reverse?: boolean
    lang?: string
}) {
    const ref = useRef<HTMLUListElement>(null)
    // arrows push this forward so the drift doesn't fight a smooth scroll
    const pausedUntil = useRef(0)
    const [loop, setLoop] = useState(false)

    // only loop when the items alone overflow the column
    useEffect(() => {
        const el = ref.current
        if (!el || loop) return
        const check = () => setLoop(el.scrollWidth > el.clientWidth + 8)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [loop])

    useEffect(() => {
        const el = ref.current
        if (!el || !loop) return
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

        let raf = 0
        let last = 0
        let pos = 0
        let held = false
        let visible = true
        const half = () => el.scrollWidth / 2

        // start the reverse rows from the far end so both directions loop
        if (reverse) el.scrollLeft = half()
        pos = el.scrollLeft

        const tick = (t: number) => {
            const dt = last ? Math.min(t - last, 64) : 0
            last = t
            const idle =
                !held && visible && !reduced.matches && t > pausedUntil.current
            if (idle) {
                pos += ((reverse ? -1 : 1) * SPEED * dt) / 1000
                if (pos >= half()) pos -= half()
                if (pos <= 0) pos += half()
                el.scrollLeft = pos
            } else {
                // someone else moved it — continue from where they left it
                pos = el.scrollLeft
            }
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)

        const hold = () => (held = true)
        const release = () => {
            held = false
            pausedUntil.current = performance.now() + RESUME_MS
        }
        const nudge = () =>
            (pausedUntil.current = performance.now() + RESUME_MS)
        // manual scrolling past either copy's edge wraps around too
        const wrap = () => {
            if (el.scrollLeft >= half()) el.scrollLeft -= half()
            else if (el.scrollLeft <= 0) el.scrollLeft += half()
        }
        el.addEventListener('pointerenter', hold)
        el.addEventListener('pointerleave', release)
        el.addEventListener('focusin', hold)
        el.addEventListener('focusout', release)
        el.addEventListener('touchstart', hold, { passive: true })
        el.addEventListener('touchend', release)
        el.addEventListener('wheel', nudge, { passive: true })
        el.addEventListener('scroll', wrap, { passive: true })
        const io = new IntersectionObserver(
            ([e]) => (visible = e.isIntersecting)
        )
        io.observe(el)

        return () => {
            cancelAnimationFrame(raf)
            io.disconnect()
            el.removeEventListener('pointerenter', hold)
            el.removeEventListener('pointerleave', release)
            el.removeEventListener('focusin', hold)
            el.removeEventListener('focusout', release)
            el.removeEventListener('touchstart', hold)
            el.removeEventListener('touchend', release)
            el.removeEventListener('wheel', nudge)
            el.removeEventListener('scroll', wrap)
        }
    }, [loop, reverse])

    const page = (dir: -1 | 1) => {
        const el = ref.current
        pausedUntil.current = performance.now() + RESUME_MS
        if (el)
            el.scrollBy({
                left: dir * el.clientWidth * 0.8,
                behavior: 'smooth',
            })
    }

    return (
        <section
            id={id}
            className="mx-auto max-w-[var(--rd-maxw)] scroll-mt-20 px-[var(--rd-pad)] py-[clamp(10px,1.4vw,16px)]"
        >
            <div className="mb-2 flex items-end justify-between gap-3">
                <h2
                    lang={lang}
                    className="rd-h-sec m-0 !text-[clamp(1.2rem,1.9vw,1.45rem)] text-[var(--rd-text)]"
                >
                    {title}
                </h2>
                {meta && (
                    <div className="flex shrink-0 items-center gap-2.5 font-[family-name:var(--font-mono)] text-[0.72rem] text-[var(--rd-text-3)]">
                        {meta}
                    </div>
                )}
            </div>
            <div className="group/row relative">
                <ul
                    ref={ref}
                    className={`m-0 flex list-none gap-[clamp(0.6rem,1.2vw,0.9rem)] overflow-x-auto overscroll-x-contain p-0 pb-1 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
                        loop
                            ? '[mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)]'
                            : ''
                    }`}
                >
                    {children}
                    {loop && ghost}
                </ul>
                {loop && (
                    <>
                        <Arrow dir={-1} onClick={() => page(-1)} />
                        <Arrow dir={1} onClick={() => page(1)} />
                    </>
                )}
            </div>
        </section>
    )
}

export default PosterRow
