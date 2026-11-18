import { Billboard } from '@/components/billboard'
import { PosterRow } from '@/components/poster-row'
import { PosterTile } from '@/components/poster-tile'
import { StatusPill } from '@/components/status-pill'
import {
    COMING,
    FRANCHISES,
    TOTALS,
    UP_NEXT,
    type Franchise,
} from '@/data/movies'
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

// billboard: the next thing to watch, else the next thing coming out
const FEATURE = UP_NEXT[0]
    ? { ...UP_NEXT[0], eyebrow: 'Up next' }
    : COMING[0]
      ? { ...COMING[0], eyebrow: 'Coming soon' }
      : null

const WRAP = 'mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)]'

// sagas with only a few entries share one shelf instead of a near-empty row
// each; bigger ones get their own
const SHORT = 5
const BIG = FRANCHISES.filter((f) => f.released > SHORT)
const SMALL = FRANCHISES.filter((f) => f.released <= SHORT)

const nextOf = (f: Franchise) => UP_NEXT.find((u) => u.franchise === f)?.entry
const released = (f: Franchise) =>
    f.entries.filter((e) => e.status !== 'upcoming')

export default function MovieLog() {
    return (
        <main className="relative min-h-screen overflow-x-clip bg-[var(--rd-bg)] pb-[clamp(2rem,5vw,4rem)] text-[var(--rd-text)]">
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
            <section
                className={`${WRAP} pb-[clamp(1.25rem,3vw,2rem)] pt-[clamp(2.5rem,6vw,4.5rem)]`}
            >
                <div className="rd-rise flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
                    <div className="max-w-[40rem]">
                        <h1 className="rd-display m-0 text-[var(--rd-text)]">
                            What I&apos;ve watched
                        </h1>
                        <p className="m-0 mt-4 max-w-[52ch] text-pretty text-[clamp(0.95rem,1.2vw,1.03rem)] leading-[1.6] text-[var(--rd-text-2)]">
                            Every saga I follow, in release order — ticked off
                            one at a time, from a galaxy far, far away to a long
                            weekend of Vietnamese cinema.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-[family-name:var(--font-mono)] text-[0.72rem] text-[var(--rd-text-3)]">
                        <span>{TOTALS.watched} watched</span>
                        <span aria-hidden>·</span>
                        <span>
                            {complete}/{FRANCHISES.length} franchises done
                        </span>
                        <span aria-hidden>·</span>
                        <span>{TOTALS.upcoming} coming</span>
                    </div>
                </div>
            </section>

            {/* ---- billboard ---- */}
            {FEATURE && (
                <div className={WRAP}>
                    <Billboard
                        franchise={FEATURE.franchise}
                        entry={FEATURE.entry}
                        eyebrow={FEATURE.eyebrow}
                    />
                </div>
            )}

            {/* ---- franchise chips ---- */}
            <nav
                aria-label="Jump to franchise"
                className={`${WRAP} mt-[clamp(1.25rem,3vw,2rem)] flex gap-1.5 overflow-x-auto [scrollbar-width:none] md:flex-wrap [&::-webkit-scrollbar]:hidden`}
            >
                {FRANCHISES.map((f) => (
                    <a
                        key={f.slug}
                        href={`#${f.slug}`}
                        lang={f.lang}
                        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-[var(--rd-border)] bg-[var(--rd-surface)] px-3 text-[0.8rem] tracking-[-0.01em] text-[var(--rd-text-2)] transition-colors hover:border-[var(--rd-text-4)] hover:text-[var(--rd-text)]"
                    >
                        {f.title}
                        <span className="font-[family-name:var(--font-mono)] text-[0.66rem] text-[var(--rd-text-3)]">
                            {f.watched}/{f.released}
                        </span>
                    </a>
                ))}
                {COMING.length > 0 && (
                    <a
                        href="#coming"
                        className="inline-flex h-8 shrink-0 items-center rounded-full border border-dashed border-[var(--rd-border-2)] px-3 text-[0.8rem] tracking-[-0.01em] text-[var(--rd-text-2)] transition-colors hover:text-[var(--rd-text)]"
                    >
                        Coming soon
                    </a>
                )}
            </nav>

            {/* ---- one shelf per franchise ---- */}
            <div className="mt-[clamp(1rem,2.5vw,1.75rem)]">
                {BIG.map((f, row) => (
                    <PosterRow
                        key={f.slug}
                        id={f.slug}
                        title={f.title}
                        lang={f.lang}
                        reverse={row % 2 === 1}
                        meta={
                            <>
                                <span className="hidden sm:inline">
                                    {f.watched}/{f.released} watched
                                </span>
                                <StatusPill state={f.state} />
                            </>
                        }
                        ghost={<FranchiseTiles f={f} ghost />}
                    >
                        <FranchiseTiles f={f} />
                    </PosterRow>
                ))}

                {SMALL.length > 0 && (
                    <PosterRow
                        title="More sagas"
                        reverse={BIG.length % 2 === 1}
                        meta={
                            <span>
                                {SMALL.length} franchises ·{' '}
                                {SMALL.reduce((n, f) => n + f.watched, 0)}{' '}
                                watched
                            </span>
                        }
                        ghost={<MoreSagas ghost />}
                    >
                        <MoreSagas />
                    </PosterRow>
                )}

                {COMING.length > 0 && (
                    <PosterRow
                        id="coming"
                        title="Coming soon"
                        reverse={BIG.length % 2 === 0}
                        meta={<span>{COMING.length} announced</span>}
                        ghost={<ComingTiles ghost />}
                    >
                        <ComingTiles />
                    </PosterRow>
                )}
            </div>
        </main>
    )
}

// Each row renders its items twice — the real set and an id-free, aria-hidden
// `ghost` copy that PosterRow appends so the drift can loop seamlessly.

function FranchiseTiles({
    f,
    ghost = false,
}: {
    f: Franchise
    ghost?: boolean
}) {
    return released(f).map((e, i, all) => (
        <GroupedTile
            key={`${i}-${e.title}`}
            label={
                e.group && e.group !== all[i - 1]?.group ? e.group : undefined
            }
        >
            <PosterTile entry={e} next={e === nextOf(f)} ghost={ghost} />
        </GroupedTile>
    ))
}

function MoreSagas({ ghost = false }: { ghost?: boolean }) {
    return SMALL.map((f) =>
        released(f).map((e, i) => (
            <GroupedTile
                key={`${f.slug}-${i}`}
                id={i === 0 && !ghost ? f.slug : undefined}
                ghost={ghost}
                label={
                    i === 0
                        ? `${f.title} ${f.watched}/${f.released}`
                        : undefined
                }
            >
                <PosterTile entry={e} next={e === nextOf(f)} ghost={ghost} />
            </GroupedTile>
        ))
    )
}

function ComingTiles({ ghost = false }: { ghost?: boolean }) {
    return COMING.map(({ franchise: f, entry: e }) => (
        <PosterTile
            key={`${f.slug}-${e.title}`}
            ghost={ghost}
            entry={{
                ...e,
                // show which saga it belongs to
                kind: 'film',
                year: [e.year, f.title].filter(Boolean).join(' · '),
            }}
        />
    ))
}

// GroupedTile — prefixes a tile with a slim vertical label where a plan's
// `## ` group starts (Marvel phases, Star Wars films/series), or where the
// next franchise starts on the shared "More sagas" shelf.
function GroupedTile({
    label,
    id,
    ghost = false,
    children,
}: {
    label?: string
    id?: string
    ghost?: boolean
    children: React.ReactNode
}) {
    if (!label) return <>{children}</>
    return (
        <>
            <li
                id={id}
                // franchise labels name what follows; phase labels are decoration
                aria-hidden={id && !ghost ? undefined : true}
                className="flex w-5 shrink-0 scroll-mt-24 items-start justify-center border-l border-[var(--rd-border)] pt-1"
            >
                <span className="font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.14em] text-[var(--rd-text-3)] [writing-mode:vertical-rl]">
                    {label}
                </span>
            </li>
            {children}
        </>
    )
}
