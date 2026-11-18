import Image from 'next/image'
import type { CSSProperties } from 'react'

// Poster — 2:3 film poster. Unwatched entries render desaturated so the
// colour on the page tracks what's actually been seen. Entries with no
// poster get a typographic one: the title set in the display serif (just
// its initial at thumbnail sizes).
export function Poster({
    src,
    title,
    width,
    dim = false,
    className = '',
    style,
    fluid = false,
}: {
    src?: string
    title: string
    /** Rendered width in px — also drives image `sizes` and fallback type. */
    width: number
    /** Fill the parent's width instead of a fixed `width`. */
    fluid?: boolean
    dim?: boolean
    className?: string
    style?: CSSProperties
}) {
    const box = `relative aspect-[2/3] shrink-0 overflow-hidden rounded-[4px] border border-[var(--rd-border)] bg-[var(--rd-surface-2)] ${className}`
    if (!src) {
        const full = width >= 48
        // Libertinus has no stacked Vietnamese diacritics (ệ, ộ …)
        const vi = /[\u1EA0-\u1EF9]/.test(title)
        return (
            <span
                aria-hidden
                style={{
                    width: fluid ? '100%' : width,
                    // px, not %: percentage padding resolves against the
                    // parent's width, not the poster's
                    ...(full && { padding: Math.round(width * 0.1) }),
                    ...(vi && { fontFamily: "'Noto Serif', Georgia, serif" }),
                    ...style,
                }}
                className={`${box} flex flex-col bg-[linear-gradient(160deg,var(--rd-surface),var(--rd-surface-2))] font-[family-name:var(--font-display)] text-[var(--rd-text-2)] ${
                    full ? 'justify-between' : 'items-center justify-center'
                }`}
            >
                {full ? (
                    <>
                        <span className="h-px w-1/3 bg-[var(--rd-accent)]" />
                        <span
                            className="line-clamp-5 leading-[1.1] tracking-[-0.02em] text-[var(--rd-text)]"
                            style={{ fontSize: Math.max(9, width * 0.15) }}
                        >
                            {title}
                        </span>
                    </>
                ) : (
                    <span
                        className="text-[var(--rd-text-3)]"
                        style={{ fontSize: Math.max(10, width * 0.42) }}
                    >
                        {title
                            .replace(/^(The|Episode [IVX]+:)\s+/i, '')
                            .charAt(0)}
                    </span>
                )}
            </span>
        )
    }
    return (
        <span
            style={{ width: fluid ? '100%' : width, ...style }}
            className={`block ${box}`}
        >
            <Image
                src={src}
                alt=""
                fill
                sizes={`${width * 2}px`}
                className={`object-cover transition-[filter,opacity] duration-300 ${
                    dim ? 'opacity-70 grayscale' : ''
                }`}
            />
        </span>
    )
}

export default Poster
