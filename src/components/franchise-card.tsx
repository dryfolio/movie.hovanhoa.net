import type { Franchise } from '@/data/movies'
import { Progress } from '@/components/progress'
import { StatusPill } from '@/components/status-pill'
import { Poster } from '@/components/poster'

// pick up to `n` posters spread evenly across the franchise
function spread(posters: string[], n: number) {
    if (posters.length <= n) return posters
    return Array.from(
        { length: n },
        (_, i) => posters[Math.round((i * (posters.length - 1)) / (n - 1))]
    )
}

// FranchiseCard — overview tile: title, span, watched/released count and a
// progress bar. Links down to the franchise's full list.
export function FranchiseCard({ franchise: f }: { franchise: Franchise }) {
    const fan = spread(f.posters, 4)
    return (
        <a
            href={`#${f.slug}`}
            className="group flex h-full flex-col rounded-[var(--rd-r)] border border-[var(--rd-border)] bg-[var(--rd-surface)] p-4 transition-colors hover:border-[var(--rd-text-4)] hover:bg-[var(--rd-surface-2)]"
        >
            {fan.length > 0 && (
                <div className="mb-4 flex h-[96px] items-end pl-1">
                    {fan.map((src, i) => (
                        <Poster
                            key={src}
                            src={src}
                            title={f.title}
                            width={64}
                            dim={f.state === 'queued'}
                            className="-ml-5 shadow-[0_4px_10px_-4px_rgb(0_0_0_/_0.35)] transition-transform duration-300 first:ml-0 group-hover:-translate-y-1"
                            style={{
                                zIndex: i,
                                rotate: `${(i - (fan.length - 1) / 2) * 4}deg`,
                                transitionDelay: `${i * 30}ms`,
                            }}
                        />
                    ))}
                </div>
            )}
            <div className="flex items-start justify-between gap-3">
                <h3 className="m-0 text-[0.95rem] font-medium leading-[1.3] tracking-[-0.02em] text-[var(--rd-text)]">
                    {f.title}
                </h3>
                <span
                    aria-hidden
                    className="text-[var(--rd-text-4)] transition-transform group-hover:translate-y-0.5 group-hover:text-[var(--rd-text-2)]"
                >
                    ↓
                </span>
            </div>
            <p className="m-0 mt-0.5 font-[family-name:var(--font-mono)] text-[0.72rem] text-[var(--rd-text-3)]">
                {f.span ?? `${f.entries.length} films`}
            </p>
            <div className="mt-auto pt-5">
                <div className="flex items-baseline justify-between gap-2">
                    <span className="font-[family-name:var(--font-display)] text-[1.9rem] leading-none tracking-[-0.03em] text-[var(--rd-text)]">
                        {f.watched}
                        <span className="text-[var(--rd-text-4)]">
                            /{f.released}
                        </span>
                    </span>
                    <StatusPill state={f.state} />
                </div>
                <Progress
                    value={f.watched}
                    total={f.released}
                    className="mt-3"
                />
            </div>
        </a>
    )
}

export default FranchiseCard
