import fs from 'node:fs'
import path from 'node:path'

// Every list lives in content/<slug>/plan.md — a plain markdown checklist
// (`- [x] Title (year)`). This module parses them at build time; the page
// never hardcodes a title.

export type EntryStatus = 'watched' | 'queued' | 'upcoming'
export type Kind = 'film' | 'series' | 'special'

export type Entry = {
    title: string
    /** Display year or range as written — "2001", "2008–2020", "2019–". */
    year?: string
    /** First year, for sorting. */
    startYear?: number
    kind: Kind
    note?: string
    status: EntryStatus
    group?: string
}

export type FranchiseState = 'complete' | 'watching' | 'queued'

export type Franchise = {
    slug: string
    title: string
    desc: string
    /** Set for non-English titles so headings can pick a font that covers them. */
    lang?: string
    entries: Entry[]
    groups: string[]
    watched: number
    /** Released entries — the denominator for progress. */
    released: number
    upcoming: number
    state: FranchiseState
    span?: string
}

type Meta = { title?: string; desc: string; lang?: string }

// Order here controls display order on the page. A plan.md without an entry
// still shows up (appended, with an empty description).
const META: Record<string, Meta> = {
    'star-wars': {
        desc: 'Every saga film, the anthology spin-offs, and the animated and live-action series.',
    },
    'harry-potter': { desc: 'All eight films, in release order.' },
    'fast-and-furious': {
        desc: 'Street racing to heists to space — the whole main line plus Hobbs & Shaw.',
    },
    'phim-vietnam': {
        title: 'Phim Việt Nam',
        lang: 'vi',
        desc: 'Vietnamese films I’ve seen — mostly in the cinema, mostly on opening week.',
    },
    'lion-king': {
        desc: 'The 1994 original, its sequels, the remake, and Mufasa.',
    },
    'pirates-of-the-caribbean': {
        desc: 'Jack Sparrow’s five voyages so far.',
    },
    avatar: { desc: 'Pandora, one sequel at a time.' },
    frozen: { desc: 'Arendelle — films and the holiday special.' },
    zootopia: { desc: 'Judy Hopps and Nick Wilde.' },
    titanic: { desc: 'A single film — no sequel needed.' },
    dune: {
        desc: 'Villeneuve’s Arrakis, plus the Bene Gesserit prequel series.',
    },
    marvel: {
        title: 'Marvel Cinematic Universe',
        desc: 'The full MCU in release order, films and Disney+ series. Not started yet — this is the big one.',
    },
}

const GROUP_LABELS: Record<string, string> = {
    'Phim điện ảnh': 'Films',
}

const CONTENT_DIR = path.join(process.cwd(), 'content')
const THIS_YEAR = new Date().getFullYear()

// "(dự kiến 2029 - chưa phát hành)" / "(series, 2024)" / "(2008-2020)" …
function parseMeta(raw: string) {
    let kind: Kind = 'film'
    let upcoming = /chưa phát hành|dự kiến/i.test(raw)
    let note: string | undefined
    const range = raw.match(/(\d{4})\s*[-–]\s*(\d{4})?(?!\d)/)
    const single = raw.match(/\d{4}/)
    let year: string | undefined
    let startYear: number | undefined
    if (range && !upcoming) {
        startYear = Number(range[1])
        year = `${range[1]}–${range[2] ?? ''}`
    } else if (single) {
        startYear = Number(single[0])
        year = single[0]
    }
    if (/\bseries\b/i.test(raw)) kind = 'series'
    if (/\bspecial\b/i.test(raw)) kind = 'special'
    if (/live-action/i.test(raw)) note = 'live-action remake'
    if (startYear && startYear > THIS_YEAR) upcoming = true
    return { kind, upcoming, note, year, startYear }
}

function parseEntry(line: string, group?: string): Entry | null {
    const m = line.match(/^- \[( |x|X)\]\s+(.+)$/)
    if (!m) return null
    const done = m[1] !== ' '
    let title = m[2].trim()
    let meta = parseMeta('')
    // only a trailing parenthetical that mentions a year or a release note is
    // metadata — "Loki (Season 1)" keeps its parenthetical in the title
    const tail = title.match(/\s*\(([^()]*)\)$/)
    if (tail && /\d{4}|chưa phát hành|series|special/i.test(tail[1])) {
        meta = parseMeta(tail[1])
        title = title.slice(0, tail.index).trim()
    }
    if (group === 'Series') meta.kind = 'series'
    if (/\(Season/i.test(title)) meta.kind = 'series'
    return {
        title,
        year: meta.year,
        startYear: meta.startYear,
        kind: meta.kind,
        note: meta.note,
        status: done ? 'watched' : meta.upcoming ? 'upcoming' : 'queued',
        group,
    }
}

function parsePlan(slug: string, md: string): Franchise {
    const lines = md.split('\n')
    const h1 = lines.find((l) => l.startsWith('# '))
    const meta = META[slug]
    const title = meta?.title ?? h1?.slice(2).split(' - ')[0].trim() ?? slug
    const entries: Entry[] = []
    const groups: string[] = []
    let group: string | undefined
    for (const line of lines) {
        if (line.startsWith('## ')) {
            const raw = line
                .slice(3)
                .replace(/\s*\(.*\)$/, '')
                .trim()
            group = GROUP_LABELS[raw] ?? raw
            groups.push(group)
            continue
        }
        const e = parseEntry(line.trim(), group)
        if (e) entries.push(e)
    }
    const watched = entries.filter((e) => e.status === 'watched').length
    const upcoming = entries.filter((e) => e.status === 'upcoming').length
    const released = entries.length - upcoming
    const years = entries
        .filter((e) => e.status !== 'upcoming' && e.startYear)
        .map((e) => e.startYear as number)
    const lo = years.length ? Math.min(...years) : undefined
    const hi = years.length ? Math.max(...years) : undefined
    return {
        slug,
        title,
        desc: meta?.desc ?? '',
        lang: meta?.lang,
        entries,
        groups,
        watched,
        released,
        upcoming,
        state:
            watched === 0
                ? 'queued'
                : watched >= released
                  ? 'complete'
                  : 'watching',
        span: lo ? (lo === hi ? `${lo}` : `${lo}–${hi}`) : undefined,
    }
}

function load(): Franchise[] {
    const slugs = fs
        .readdirSync(CONTENT_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .filter((s) => fs.existsSync(path.join(CONTENT_DIR, s, 'plan.md')))
    const order = Object.keys(META)
    slugs.sort((a, b) => {
        const ia = order.indexOf(a)
        const ib = order.indexOf(b)
        return (ia < 0 ? 1e3 : ia) - (ib < 0 ? 1e3 : ib) || a.localeCompare(b)
    })
    return slugs.map((s) =>
        parsePlan(
            s,
            fs.readFileSync(path.join(CONTENT_DIR, s, 'plan.md'), 'utf8')
        )
    )
}

export const FRANCHISES: Franchise[] = load()

export const TOTALS = FRANCHISES.reduce(
    (t, f) => ({
        watched: t.watched + f.watched,
        released: t.released + f.released,
        upcoming: t.upcoming + f.upcoming,
    }),
    { watched: 0, released: 0, upcoming: 0 }
)

/** The next released-but-unwatched entry of every franchise in progress. */
export const UP_NEXT = FRANCHISES.flatMap((f) => {
    const next = f.entries.find((e) => e.status === 'queued')
    return next ? [{ franchise: f, entry: next }] : []
})

/** Announced entries across every franchise, soonest first. */
export const COMING = FRANCHISES.flatMap((f) =>
    f.entries
        .filter((e) => e.status === 'upcoming')
        .map((entry) => ({ franchise: f, entry }))
).sort((a, b) => (a.entry.startYear ?? 9999) - (b.entry.startYear ?? 9999))
