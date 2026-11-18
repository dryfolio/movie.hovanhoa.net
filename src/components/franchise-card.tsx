import type { Franchise } from '@/data/movies'
import { Progress } from '@/components/progress'
import { StatusPill } from '@/components/status-pill'

// FranchiseCard — overview tile: title, span, watched/released count and a
// progress bar. Links down to the franchise's full list.
export function FranchiseCard({ franchise: f }: { franchise: Franchise }) {
    return (
        <a
            href={`#${f.slug}`}
            className="group flex h-full flex-col rounded-[var(--rd-r)] border border-[var(--rd-border)] bg-[var(--rd-surface)] p-4 transition-colors hover:border-[var(--rd-text-4)] hover:bg-[var(--rd-surface-2)]"
        >
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
