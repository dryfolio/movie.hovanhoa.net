import Image from 'next/image'
import type { CSSProperties } from 'react'

// Poster — 2:3 film poster. Unwatched entries render desaturated so the
// colour on the page tracks what's actually been seen; entries with no
// poster fall back to a bordered tile with the title's initial.
export function Poster({
    src,
    title,
    width,
    dim = false,
    className = '',
    style,
}: {
    src?: string
    title: string
    width: number
    dim?: boolean
    className?: string
    style?: CSSProperties
}) {
    const box = `relative aspect-[2/3] shrink-0 overflow-hidden rounded-[4px] border border-[var(--rd-border)] bg-[var(--rd-surface-2)] ${className}`
    if (!src)
        return (
            <span
                aria-hidden
                style={{ width, ...style }}
                className={`${box} flex items-center justify-center font-[family-name:var(--font-display)] text-[var(--rd-text-4)]`}
            >
                <span style={{ fontSize: Math.max(10, width * 0.42) }}>
                    {title.replace(/^(The|Episode [IVX]+:)\s+/i, '').charAt(0)}
                </span>
            </span>
        )
    return (
        <span style={{ width, ...style }} className={box}>
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
