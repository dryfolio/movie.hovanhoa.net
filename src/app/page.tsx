import { FranchiseCard } from '@/components/franchise-card'
import { FranchiseSection } from '@/components/franchise-section'
import { SectionHead } from '@/components/section-head'
import { Reveal } from '@/components/redesign/reveal'
import { Poster } from '@/components/poster'
import { PosterStrip } from '@/components/poster-strip'
import { COMING, FRANCHISES, TOTALS, UP_NEXT } from '@/data/movies'
import {
    FULL_NAME,
    GITHUB,
    IMAGE,
    LINKEDIN,
    MOVIE_URL,
    NAME,
    ROLE,
    TWITTER,
} from '@/constants'
import type { Metadata } from 'next'

const DESCRIPTION = `${FULL_NAME} - ${ROLE}. A watch log of the film franchises I follow — what I've seen, what's next, and what's still coming out.`

export const metadata: Metadata = {
    title: 'hovanhoa | movie',
    description: DESCRIPTION,
    alternates: {
        canonical: MOVIE_URL,
    },
}

const complete = FRANCHISES.filter((f) => f.state === 'complete').length

// every watched poster, newest release first
const REEL = FRANCHISES.flatMap((f) =>
    f.entries.filter((e) => e.status === 'watched' && e.poster)
)
    .sort((a, b) => (b.startYear ?? 0) - (a.startYear ?? 0))
    .map((e) => ({ src: e.poster as string, title: e.title }))

const SECTION =
    'mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(40px,5vw,64px)]'

export default function MovieLog() {
    return (
        <main className="relative min-h-screen bg-[var(--rd-bg)] text-[var(--rd-text)]">
            <script
                type="application/ld+json"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'CollectionPage',
                        name: `${NAME} | movie`,
                        url: MOVIE_URL,
                        author: {
                            '@type': 'Person',
                            name: FULL_NAME,
                            alternateName: NAME,
                            jobTitle: ROLE,
                            image: `${MOVIE_URL}${IMAGE}`,
                            sameAs: [
                                `https://twitter.com/${TWITTER}`,
                                `https://github.com/${GITHUB}`,
                                `https://linkedin.com/in/${LINKEDIN}`,
                            ],
                        },
                        description: `The film franchises ${FULL_NAME} follows, with watch progress for each.`,
                    }),
                }}
            />

            {/* ---- page header ---- */}
            <section className="mx-auto w-full max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pb-[clamp(2rem,4vw,3rem)] pt-[clamp(3.5rem,8vw,6.5rem)]">
                <div className="rd-rise max-w-[46rem]">
                    <h1 className="rd-display m-0 text-[var(--rd-text)]">
                        What I&apos;ve watched
                    </h1>
                    <p className="m-0 mt-[clamp(1.1rem,2vw,1.5rem)] max-w-[56ch] text-pretty text-[clamp(0.98rem,1.25vw,1.0625rem)] leading-[1.65] text-[var(--rd-text-2)]">
                        A watch log for the sagas I follow, every entry in
                        release order. Ticked off one at a time, from a galaxy
                        far, far away to a long weekend of Vietnamese cinema.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-[family-name:var(--font-mono)] text-[0.72rem] text-[var(--rd-text-3)]">
                        <span>{TOTALS.watched} watched</span>
                        <span aria-hidden>·</span>
                        <span>
                            {TOTALS.released - TOTALS.watched} on the list
                        </span>
                        <span aria-hidden>·</span>
                        <span>{TOTALS.upcoming} announced</span>
                        <span aria-hidden>·</span>
                        <span>
                            {complete}/{FRANCHISES.length} franchises complete
                        </span>
                    </div>
                    <nav
                        aria-label="Jump to section"
                        className="mt-[clamp(1.2rem,2.2vw,1.7rem)] flex flex-wrap items-center gap-[0.55rem]"
                    >
                        {[
                            { href: '#up-next', label: 'Up next' },
                            { href: '#franchises', label: 'Franchises' },
                            { href: '#coming', label: 'Coming soon' },
                        ].map((s, i) => (
                            <span
                                key={s.href}
                                className="inline-flex items-center gap-[0.55rem]"
                            >
                                {i > 0 && (
                                    <span
                                        aria-hidden
                                        className="select-none text-[var(--rd-text-4)]"
                                    >
                                        |
                                    </span>
                                )}
                                <a
                                    href={s.href}
                                    className="border-b border-[color-mix(in_srgb,var(--rd-text)_22%,transparent)] text-[0.875rem] tracking-[-0.01em] text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent)] hover:text-[var(--rd-accent-ink)]"
                                >
                                    {s.label}
                                </a>
                            </span>
                        ))}
                    </nav>
                </div>
            </section>

            {/* ---- poster reel ---- */}
            <div className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pb-[clamp(2.5rem,5vw,4rem)]">
                <PosterStrip posters={REEL} />
            </div>

            {/* ---- up next ---- */}
            {UP_NEXT.length > 0 && (
                <section
                    id="up-next"
                    className={`${SECTION} scroll-mt-20 !pt-[clamp(1rem,3vw,2rem)]`}
                >
                    <SectionHead
                        title="Up next"
                        meta={`${UP_NEXT.length} queued`}
                    />
                    <ul className="m-0 flex list-none flex-col overflow-hidden rounded-[var(--rd-r-lg)] border border-[var(--rd-border)] bg-[var(--rd-surface)] p-0">
                        {UP_NEXT.map(({ franchise: f, entry: e }) => (
                            <li
                                key={f.slug}
                                className="border-b border-[var(--rd-line)] last:border-b-0"
                            >
                                <a
                                    href={`#${f.slug}`}
                                    className="flex min-w-0 items-center gap-4 px-[1.15rem] py-4 transition-colors hover:bg-[var(--rd-surface-2)]"
                                >
                                    <Poster
                                        src={e.poster}
                                        title={e.title}
                                        width={48}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="m-0 font-[family-name:var(--font-mono)] text-[0.72rem] text-[var(--rd-text-3)]">
                                            {f.title} · {f.watched}/{f.released}{' '}
                                            watched
                                        </p>
                                        <p className="m-0 mt-1 text-[1rem] font-medium leading-[1.3] tracking-[-0.02em] text-[var(--rd-text)]">
                                            {e.title}
                                            {e.kind !== 'film' && (
                                                <span className="ml-2 font-[family-name:var(--font-mono)] text-[0.68rem] font-normal text-[var(--rd-text-3)]">
                                                    {e.kind}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <span className="shrink-0 font-[family-name:var(--font-mono)] text-[0.72rem] tabular-nums text-[var(--rd-text-3)]">
                                        {e.year}
                                    </span>
                                    <span
                                        aria-hidden
                                        className="text-[var(--rd-text-4)]"
                                    >
                                        →
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* ---- overview ---- */}
            <section
                id="franchises"
                className={`${SECTION} scroll-mt-20 !pt-0`}
            >
                <SectionHead
                    title="Franchises"
                    meta={`${FRANCHISES.length} lists · ${TOTALS.watched}/${TOTALS.released} released entries`}
                />
                <div className="grid grid-cols-2 gap-[clamp(0.6rem,1.5vw,1rem)] sm:grid-cols-3 lg:grid-cols-4">
                    {FRANCHISES.map((f, i) => (
                        <Reveal key={f.slug} delay={i * 30}>
                            <FranchiseCard franchise={f} />
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ---- every list ---- */}
            <div className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)]">
                {FRANCHISES.map((f) => (
                    <FranchiseSection key={f.slug} franchise={f} />
                ))}
            </div>

            {/* ---- coming soon ---- */}
            {COMING.length > 0 && (
                <section id="coming" className={`${SECTION} scroll-mt-20`}>
                    <div className="border-t border-[var(--rd-line)] pt-[clamp(40px,5vw,64px)]">
                        <SectionHead
                            title="Coming soon"
                            meta={`${COMING.length} announced`}
                        >
                            <p className="m-0 mt-2 max-w-[58ch] text-[0.95rem] leading-[1.6] text-[var(--rd-text-2)]">
                                Announced but not out yet — already on the list.
                            </p>
                        </SectionHead>
                        <ol className="m-0 grid list-none grid-cols-1 gap-[clamp(0.6rem,1.5vw,1rem)] p-0 sm:grid-cols-2 lg:grid-cols-3">
                            {COMING.map(({ franchise: f, entry: e }) => (
                                <li
                                    key={`${f.slug}-${e.title}`}
                                    className="flex items-center gap-4 rounded-[var(--rd-r)] border border-dashed border-[var(--rd-border-2)] p-3"
                                >
                                    <Poster
                                        src={e.poster}
                                        title={e.title}
                                        width={56}
                                    />
                                    <span className="min-w-0">
                                        <span className="block font-[family-name:var(--font-display)] text-[1.35rem] leading-none tracking-[-0.03em] text-[var(--rd-text)]">
                                            {e.startYear ?? 'tba'}
                                        </span>
                                        <span className="mt-2 block text-[0.9rem] font-medium leading-[1.3] tracking-[-0.01em] text-[var(--rd-text)]">
                                            {e.title}
                                        </span>
                                        <span className="mt-0.5 block font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--rd-text-3)]">
                                            {f.title}
                                        </span>
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>
            )}
        </main>
    )
}
