import type { Entry } from '@/data/movies'
import { Poster } from '@/components/poster'

// PosterTile — one entry in a PosterRow: poster with a status badge, title
// and year underneath. Watched posters are in colour, everything else is
// greyscale until it's been seen.
export function PosterTile({
    entry: e,
    next = false,
}: {
    entry: Entry
    next?: boolean
}) {
    const watched = e.status === 'watched'
    return (
        <li className="group/tile w-[clamp(100px,10.5vw,128px)] shrink-0 snap-start">
            <div className="relative transition-transform duration-300 ease-out group-hover/tile:-translate-y-1 group-hover/tile:scale-[1.03]">
                <Poster
                    src={e.poster}
                    title={e.title}
                    width={128}
                    fluid
                    dim={!watched}
                    className="!rounded-[var(--rd-r-sm)] group-hover/tile:shadow-[0_14px_28px_-12px_rgb(0_0_0_/_0.45)]"
                />
                {watched && (
                    <span
                        aria-label="watched"
                        className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--rd-accent)] text-white shadow-[0_2px_6px_rgb(0_0_0_/_0.3)]"
                    >
                        <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden
                        >
                            <path d="M20 6 9 17l-5-5" />
                        </svg>
                    </span>
                )}
                {(next || e.status === 'upcoming') && (
                    <span className="absolute left-1.5 top-1.5 rounded-[4px] bg-[rgb(0_0_0_/_0.72)] px-1.5 py-[1px] font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.08em] text-white">
                        {next ? 'up next' : 'soon'}
                    </span>
                )}
            </div>
            <p
                className={`m-0 mt-1.5 truncate text-[0.78rem] leading-[1.3] tracking-[-0.01em] ${
                    watched
                        ? 'text-[var(--rd-text)]'
                        : 'text-[var(--rd-text-2)]'
                }`}
                title={e.title}
            >
                {e.title}
            </p>
            <p className="m-0 mt-0.5 font-[family-name:var(--font-mono)] text-[0.66rem] text-[var(--rd-text-3)]">
                {[e.year, e.kind !== 'film' ? e.kind : '']
                    .filter(Boolean)
                    .join(' · ') || ' '}
            </p>
        </li>
    )
}

export default PosterTile
