'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

// the row scrolls edge to edge but its first item lines up with the page
// container — this is the container's left edge inside a full-width box
const GUTTER =
    'max(var(--rd-pad), calc((100vw - var(--rd-maxw)) / 2 + var(--rd-pad)))'

function Arrow({
    dir,
    onClick,
    hidden,
}: {
    dir: -1 | 1
    onClick: () => void
    hidden: boolean
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={dir < 0 ? 'Scroll left' : 'Scroll right'}
            tabIndex={hidden ? -1 : 0}
            className={`absolute top-0 z-10 hidden h-[calc(100%-2.6rem)] w-12 items-center justify-center text-[var(--rd-text)] transition-opacity duration-200 md:flex ${
                dir < 0
                    ? 'left-0 bg-[linear-gradient(90deg,var(--rd-bg),transparent)]'
                    : 'right-0 bg-[linear-gradient(270deg,var(--rd-bg),transparent)]'
            } ${hidden ? 'pointer-events-none opacity-0' : 'opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100'}`}
        >
            <svg
                width="22"
                height="22"
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

// PosterRow — a Netflix-style horizontal shelf: native scroll + snap (touch
// and trackpad just work), with hover arrows on desktop.
export function PosterRow({
    id,
    title,
    meta,
    children,
    lang,
}: {
    id?: string
    title: ReactNode
    meta?: ReactNode
    children: ReactNode
    lang?: string
}) {
    const ref = useRef<HTMLUListElement>(null)
    const [edge, setEdge] = useState({ start: true, end: false })

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const update = () =>
            setEdge({
                start: el.scrollLeft < 8,
                end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8,
            })
        update()
        el.addEventListener('scroll', update, { passive: true })
        window.addEventListener('resize', update)
        return () => {
            el.removeEventListener('scroll', update)
            window.removeEventListener('resize', update)
        }
    }, [])

    const page = (dir: -1 | 1) => {
        const el = ref.current
        if (el)
            el.scrollBy({
                left: dir * el.clientWidth * 0.8,
                behavior: 'smooth',
            })
    }

    return (
        <section id={id} className="scroll-mt-20 py-[clamp(10px,1.4vw,16px)]">
            <div className="mx-auto mb-2 flex max-w-[var(--rd-maxw)] items-end justify-between gap-3 px-[var(--rd-pad)]">
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
                    style={{
                        paddingInline: GUTTER,
                        scrollPaddingInline: GUTTER,
                    }}
                    className="m-0 flex list-none snap-x snap-mandatory gap-[clamp(0.6rem,1.2vw,0.9rem)] overflow-x-auto overscroll-x-contain p-0 pb-1 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {children}
                </ul>
                <Arrow dir={-1} onClick={() => page(-1)} hidden={edge.start} />
                <Arrow dir={1} onClick={() => page(1)} hidden={edge.end} />
            </div>
        </section>
    )
}

export default PosterRow
