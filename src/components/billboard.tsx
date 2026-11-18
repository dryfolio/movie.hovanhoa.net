import Image from 'next/image'
import type { Entry, Franchise } from '@/data/movies'
import { Poster } from '@/components/poster'
import { Progress } from '@/components/progress'

// Billboard — the big "what's next" panel at the top of the page: the
// poster blown up and blurred as a backdrop, the poster itself, and where
// this sits in its franchise.
export function Billboard({
    franchise: f,
    entry: e,
    eyebrow,
}: {
    franchise: Franchise
    entry: Entry
    eyebrow: string
}) {
    return (
        <a
            href={`#${f.slug}`}
            className="group relative isolate block overflow-hidden rounded-[var(--rd-r-lg)] border border-[var(--rd-border)] bg-[var(--rd-surface)]"
        >
            {e.poster && (
                <div aria-hidden className="absolute inset-0 -z-10">
                    <Image
                        src={e.poster}
                        alt=""
                        fill
                        sizes="1120px"
                        className="scale-125 object-cover opacity-60 blur-2xl saturate-150 dark:opacity-40"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--rd-surface)_15%,color-mix(in_srgb,var(--rd-surface)_55%,transparent)_60%,transparent)]" />
                </div>
            )}
            <div className="flex items-center gap-[clamp(1.25rem,4vw,3rem)] p-[clamp(1.25rem,3.5vw,2.5rem)]">
                <div className="min-w-0 flex-1">
                    <p className="m-0 font-[family-name:var(--font-mono)] text-[0.72rem] uppercase tracking-[0.14em] text-[var(--rd-accent-ink)]">
                        {eyebrow}
                    </p>
                    <h2 className="rd-display m-0 mt-3 !text-[clamp(2rem,5vw,3.4rem)] text-[var(--rd-text)]">
                        {e.title}
                    </h2>
                    <p className="m-0 mt-3 font-[family-name:var(--font-mono)] text-[0.75rem] text-[var(--rd-text-2)]">
                        {[f.title, e.year, e.kind !== 'film' ? e.kind : '']
                            .filter(Boolean)
                            .join(' · ')}
                    </p>
                    <div className="mt-6 max-w-[20rem]">
                        <div className="mb-2 flex justify-between font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--rd-text-3)]">
                            <span>{f.title}</span>
                            <span>
                                {f.watched}/{f.released} watched
                            </span>
                        </div>
                        <Progress value={f.watched} total={f.released} />
                    </div>
                    <span className="mt-6 inline-flex h-9 items-center gap-2 rounded-full bg-[var(--rd-text)] px-4 text-[0.8125rem] font-medium text-[var(--rd-bg)] transition-opacity group-hover:opacity-90">
                        See the whole {f.entries.length > 1 ? 'list' : 'entry'}
                        <span aria-hidden>↓</span>
                    </span>
                </div>
                <Poster
                    src={e.poster}
                    title={e.title}
                    width={190}
                    className="!hidden !rounded-[var(--rd-r-sm)] shadow-[0_24px_48px_-20px_rgb(0_0_0_/_0.55)] transition-transform duration-500 group-hover:-rotate-1 group-hover:scale-[1.02] sm:!block"
                />
            </div>
        </a>
    )
}

export default Billboard
