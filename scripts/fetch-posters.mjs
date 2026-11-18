// Downloads a poster for every entry in content/*/plan.md from Wikipedia's
// infobox image (en.wikipedia, or vi.wikipedia for Vietnamese films) into
// public/posters/<slug>/<n>.<ext>, and records the matches in
// src/data/posters.json. Already-matched entries are skipped, so it's safe to
// re-run after adding a film.
//
//   node scripts/fetch-posters.mjs            # fetch anything missing
//   node scripts/fetch-posters.mjs --refresh  # re-fetch everything
//
// The search picks the top hit for "<title> <year> film" — check the result
// and pin the right article in OVERRIDES when it guesses wrong.

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const CONTENT = path.join(ROOT, 'content')
const OUT = path.join(ROOT, 'public', 'posters')
const MANIFEST = path.join(ROOT, 'src', 'data', 'posters.json')
const UA = 'movie.hovanhoa.net poster fetch (https://movie.hovanhoa.net)'
const REFRESH = process.argv.includes('--refresh')

// "<slug>/<title> (<year>)" (the manifest key) → Wikipedia article, or `null`
// for no poster. Prefix with "vi:" for Vietnamese Wikipedia.
const OVERRIDES = {
    'fast-and-furious/The Fast and the Furious: Tokyo Drift (2006)':
        'The Fast and the Furious: Tokyo Drift',
    'marvel/Avengers: Age of Ultron (2015)': 'Avengers: Age of Ultron',
    'marvel/Avengers: Endgame (2019)': 'Avengers: Endgame',
    'marvel/What If...? (Season 1) (2021)': 'What If...? season 1',
    'marvel/What If...? (Season 2 & 3) (2023)': 'What If...? season 2',
    'marvel/Echo (2024)': 'Echo (miniseries)',
    'marvel/Avengers: Secret Wars (2027)': null,
    'star-wars/Visions (2021)': 'Star Wars: Visions',
    'star-wars/Tales of the Jedi (2022)': 'Star Wars: Tales of the Jedi',
    'star-wars/Tales of the Empire (2024)': 'Star Wars: Tales of the Empire',
    'phim-vietnam/Tiệc trăng máu': 'vi:Tiệc trăng máu',
    // no Wikipedia article — the search lands on unrelated pages
    'phim-vietnam/Phi phong': null,
    'phim-vietnam/Làm giàu với ma': null,
}

const VI_SLUGS = new Set(['phim-vietnam'])

async function api(lang, params) {
    const url = `https://${lang}.wikipedia.org/w/api.php?${new URLSearchParams({
        format: 'json',
        formatversion: '2',
        redirects: '1',
        ...params,
    })}`
    let res
    for (let i = 0; i < 3; i++) {
        res = await fetch(url, { headers: { 'User-Agent': UA } })
        if (res.ok) return res.json()
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)))
    }
    throw new Error(`wikipedia ${res.status}: ${url}`)
}

async function search(lang, q) {
    const r = await api(lang, {
        action: 'query',
        list: 'search',
        srsearch: q,
        srlimit: '1',
    })
    return r.query.search[0]?.title
}

// raster images only — TV series often carry an .svg title logo instead of a
// poster, which looks wrong in a poster slot
const IMAGE_FIELD =
    /\|\s*(?:image|poster|hình|hình ảnh|image_file)\s*=\s*(?:\[\[)?(?:(?:File|Image|Tập tin|Hình):)?([^|\]\n]+?\.(?:jpe?g|png|webp|gif))/i

async function posterFor(lang, title) {
    const r = await api(lang, {
        action: 'query',
        titles: title,
        prop: 'revisions',
        rvprop: 'content',
        rvslots: 'main',
    })
    const page = r.query.pages[0]
    const text = page.revisions?.[0]?.slots.main.content
    const m = text?.replace(/<!--[\s\S]*?-->/g, '').match(IMAGE_FIELD)
    if (!m) return null
    const file = m[1].trim()
    const ii = await api(lang, {
        action: 'query',
        titles: `File:${file}`,
        prop: 'imageinfo',
        iiprop: 'url',
        iiurlwidth: '342',
    })
    const info = ii.query.pages[0].imageinfo?.[0]
    const url = info?.thumburl ?? info?.url
    return url ? { article: page.title, file, url: url.split('?')[0] } : null
}

function entries(slug) {
    const md = fs.readFileSync(path.join(CONTENT, slug, 'plan.md'), 'utf8')
    let group = ''
    const out = []
    for (const line of md.split('\n')) {
        if (line.startsWith('## ')) group = line.slice(3)
        const m = line.trim().match(/^- \[[ xX]\]\s+(.+)$/)
        if (!m) continue
        const raw = m[1].trim()
        const tail = raw.match(/\s*\(([^()]*)\)$/)
        const meta =
            tail && /\d{4}|chưa phát hành|series|special/i.test(tail[1])
                ? tail[1]
                : ''
        const title = meta ? raw.slice(0, tail.index).trim() : raw
        if (/chưa phát hành/i.test(meta)) continue
        const year = meta.match(/\d{4}/)?.[0] ?? ''
        const series =
            /series/i.test(meta) ||
            /series/i.test(group) ||
            /\(Season/i.test(title)
        out.push({ title, year, series })
    }
    return out
}

const manifest = fs.existsSync(MANIFEST)
    ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
    : {}
const slugs = fs
    .readdirSync(CONTENT)
    .filter((s) => fs.existsSync(path.join(CONTENT, s, 'plan.md')))
    .sort()

for (const slug of slugs) {
    const list = entries(slug)
    for (const [i, e] of list.entries()) {
        const key = `${slug}/${e.title}${e.year ? ` (${e.year})` : ''}`
        if (manifest[key] && !REFRESH) continue
        try {
            let lang = VI_SLUGS.has(slug) ? 'vi' : 'en'
            let article = OVERRIDES[key]
            if (article === null) continue
            if (article?.startsWith('vi:'))
                [lang, article] = ['vi', article.slice(3)]
            if (!article) {
                const q =
                    lang === 'vi'
                        ? `${e.title} phim`
                        : `${e.title} ${e.year} ${e.series ? 'TV series' : 'film'}`
                article = await search(lang, q)
            }
            const p = article && (await posterFor(lang, article))
            if (!p) {
                console.log(
                    `  – ${key}: no poster (${article ?? 'no article'})`
                )
                continue
            }
            const res = await fetch(p.url, { headers: { 'User-Agent': UA } })
            if (!res.ok) throw new Error(`download ${res.status}`)
            fs.mkdirSync(path.join(OUT, slug), { recursive: true })
            const rel = `${slug}/${String(i + 1).padStart(2, '0')}.jpg`
            const tmp = path.join(OUT, `${rel}.tmp${path.extname(p.url)}`)
            fs.writeFileSync(tmp, Buffer.from(await res.arrayBuffer()))
            // macOS `sips`: normalise to a ≤420px JPEG
            execFileSync(
                'sips',
                [
                    '-s',
                    'format',
                    'jpeg',
                    '-s',
                    'formatOptions',
                    '78',
                    '-Z',
                    '420',
                    tmp,
                    '--out',
                    path.join(OUT, rel),
                ],
                { stdio: 'ignore' }
            )
            fs.unlinkSync(tmp)
            // TV series often only have a 16:9 title card — not a poster
            const dims = execFileSync('sips', [
                '-g',
                'pixelWidth',
                '-g',
                'pixelHeight',
                path.join(OUT, rel),
            ])
                .toString()
                .match(/\d+(?=\n)/g)
                .map(Number)
            if (dims[1] / dims[0] < 0.7) {
                fs.unlinkSync(path.join(OUT, rel))
                console.log(
                    `  – ${key}: title card, not a poster (${lang}:${p.article})`
                )
                continue
            }
            manifest[key] = {
                src: `/posters/${rel}`,
                article: `${lang}:${p.article}`,
            }
            console.log(`  ✓ ${key} ← ${lang}:${p.article}`)
        } catch (err) {
            console.log(`  ! ${key}: ${err.message}`)
        }
    }
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
