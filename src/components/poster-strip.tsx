import Image from 'next/image'

// PosterStrip — a slow, looping reel of watched posters under the page
// header. The list is rendered twice so the -50% translate loops seamlessly;
// motion stops for prefers-reduced-motion (see .rd-reel in globals.css).
export function PosterStrip({
    posters,
}: {
    posters: { src: string; title: string }[]
}) {
    if (posters.length === 0) return null
    return (
        <div
            aria-hidden
            className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]"
        >
            <div className="rd-reel flex w-max">
                {[...posters, ...posters].map((p, i) => (
                    <span
                        key={i}
                        className="relative mr-[clamp(0.5rem,1vw,0.75rem)] aspect-[2/3] w-[clamp(84px,9vw,118px)] shrink-0 overflow-hidden rounded-[var(--rd-r-sm)] border border-[var(--rd-border)] bg-[var(--rd-surface-2)]"
                    >
                        <Image
                            src={p.src}
                            alt=""
                            fill
                            sizes="240px"
                            className="object-cover"
                        />
                    </span>
                ))}
            </div>
        </div>
    )
}

export default PosterStrip
