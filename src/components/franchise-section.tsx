import type { Entry, Franchise } from '@/data/movies'
import { SectionHead } from '@/components/section-head'
import { StatusPill } from '@/components/status-pill'
import { Progress } from '@/components/progress'
import { Poster } from '@/components/poster'

function Mark({ status }: { status: Entry['status'] }) {
    if (status === 'watched')
        return (
            <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-label="watched"
                className="shrink-0 text-[var(--rd-accent)]"
            >
                <path d="M20 6 9 17l-5-5" />
            </svg>
        )
    return (
        <span
            aria-label={
                status === 'upcoming' ? 'not released yet' : 'not watched yet'
            }
            className={`mx-[2px] h-[10px] w-[10px] shrink-0 rounded-full border ${
                status === 'upcoming'
                    ? 'border-dashed border-[var(--rd-text-4)]'
                    : 'border-[var(--rd-text-3)]'
            }`}
        />
    )
}

function EntryRow({ entry: e, n }: { entry: Entry; n: number }) {
    const dim = e.status !== 'watched'
    return (
        <li className="flex min-w-0 items-center gap-3 border-b border-[var(--rd-line)] py-2">
            <span className="w-6 shrink-0 text-right font-[family-name:var(--font-mono)] text-[0.68rem] tabular-nums text-[var(--rd-text-4)]">
                {String(n).padStart(2, '0')}
            </span>
            <Poster src={e.poster} title={e.title} width={26} dim={dim} />
            <Mark status={e.status} />
            <span
                className={`min-w-0 flex-1 text-[0.9rem] leading-[1.35] tracking-[-0.01em] ${
                    dim ? 'text-[var(--rd-text-2)]' : 'text-[var(--rd-text)]'
                }`}
            >
                {e.title}
                {(e.kind !== 'film' || e.note) && (
                    <span className="ml-2 font-[family-name:var(--font-mono)] text-[0.66rem] text-[var(--rd-text-3)]">
                        {e.note ?? e.kind}
                    </span>
                )}
            </span>
            <span className="shrink-0 font-[family-name:var(--font-mono)] text-[0.72rem] tabular-nums text-[var(--rd-text-3)]">
                {e.status === 'upcoming'
                    ? e.year
                        ? `soon · ${e.year}`
                        : 'soon'
                    : e.year}
            </span>
        </li>
    )
}

// two columns that read top-to-bottom, so release order survives the split
const LIST =
    'm-0 list-none gap-x-[clamp(1.5rem,4vw,3rem)] p-0 md:columns-2 [&>li]:break-inside-avoid'

// FranchiseSection — one franchise's full checklist, in release order, split
// by the plan's `## ` groups when it has them.
export function FranchiseSection({ franchise: f }: { franchise: Franchise }) {
    const grouped = f.groups.length > 0
    let n = 0
    const rows = (entries: Entry[]) =>
        entries.map((e) => {
            n += 1
            return <EntryRow key={`${n}-${e.title}`} entry={e} n={n} />
        })

    return (
        <section
            id={f.slug}
            className="scroll-mt-20 border-t border-[var(--rd-line)] py-[clamp(40px,5vw,64px)]"
        >
            <SectionHead
                title={f.title}
                lang={f.lang}
                meta={
                    <span className="inline-flex items-center gap-2.5">
                        <span>
                            {f.watched} / {f.released} watched
                            {f.upcoming ? ` · ${f.upcoming} announced` : ''}
                        </span>
                        <StatusPill state={f.state} />
                    </span>
                }
            >
                {f.desc && (
                    <p className="m-0 mt-2 max-w-[58ch] text-[0.95rem] leading-[1.6] text-[var(--rd-text-2)]">
                        {f.desc}
                    </p>
                )}
            </SectionHead>

            <Progress
                value={f.watched}
                total={f.released}
                className="mb-4 max-w-[16rem]"
            />

            {grouped ? (
                <div className="flex flex-col gap-7">
                    {f.groups.map((g) => {
                        const items = f.entries.filter((e) => e.group === g)
                        const done = items.filter(
                            (e) => e.status === 'watched'
                        ).length
                        return (
                            <div key={g}>
                                <p className="m-0 mb-1 flex items-baseline justify-between gap-3 font-[family-name:var(--font-mono)] text-[0.72rem] text-[var(--rd-text-3)]">
                                    <span className="font-medium uppercase tracking-[0.12em] text-[var(--rd-text-2)]">
                                        {g}
                                    </span>
                                    <span>
                                        {done}/{items.length}
                                    </span>
                                </p>
                                <ol className={LIST}>{rows(items)}</ol>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <ol className={LIST}>{rows(f.entries)}</ol>
            )}
        </section>
    )
}

export default FranchiseSection
