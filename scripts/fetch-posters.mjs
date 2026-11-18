// Downloads a poster for every entry in content/*/plan.md into
// public/posters/<slug>/<file>.jpg and records the matches in
// src/data/posters.json. Sources, in order: the Wikipedia infobox image
// (vi.wikipedia for Vietnamese films), the article's "season 1" page, then
// TVmaze (Disney+/HBO series whose Wikipedia infobox is only a logo). Already-matched entries are skipped, so it's safe to
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
    'pirates-of-the-caribbean/Phần 6': null,
    // only a sequel announcement — the search lands on the previous film
    'avatar/Avatar 4 (2029)': null,
    'avatar/Avatar 5 (2031)': null,
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

async function tvmaze(title, year) {
    const res = await fetch(
        `https://api.tvmaze.com/singlesearch/shows?${new URLSearchParams({ q: title })}`,
        { headers: { 'User-Agent': UA } }
    )
    if (!res.ok) return null
    const show = await res.json()
    const premiered = Number(show.premiered?.slice(0, 4))
    // the fuzzy search happily returns an unrelated show — require the year
    if (year && Math.abs(premiered - Number(year)) > 1) return null
    const url = show.image?.original
    return url ? { source: `tvmaze:${show.name}`, url } : null
}

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
    return url
        ? { source: `${lang}:${page.title}`, url: url.split('?')[0] }
        : null
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
        const year = meta.match(/\d{4}/)?.[0] ?? ''
        const series =
            /series/i.test(meta) ||
            /series/i.test(group) ||
            /\(Season/i.test(title)
        out.push({ title, year, series })
    }
    return out
}

const slugify = (t) =>
    t
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/đ/gi, 'd')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

// downloads `url`, normalises it to a ≤420px JPEG (macOS `sips`) and
// returns its [width, height]
async function save(url, out) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    if (!res.ok) throw new Error(`download ${res.status}`)
    const tmp = `${out}.tmp${path.extname(new URL(url).pathname)}`
    fs.writeFileSync(tmp, Buffer.from(await res.arrayBuffer()))
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
            out,
        ],
        { stdio: 'ignore' }
    )
    fs.unlinkSync(tmp)
    return execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', out])
        .toString()
        .match(/\d+(?=\n)/g)
        .map(Number)
}

// candidate lookups for one entry, tried in order until one yields a
// portrait poster
function candidates(slug, e, key) {
    let lang = VI_SLUGS.has(slug) ? 'vi' : 'en'
    let article = OVERRIDES[key]
    if (article === null) return []
    if (article?.startsWith('vi:')) [lang, article] = ['vi', article.slice(3)]
    const wiki = async () => {
        const a =
            article ??
            (await search(
                lang,
                lang === 'vi'
                    ? `${e.title} phim`
                    : `${e.title} ${e.year} ${e.series ? 'TV series' : 'film'}`
            ))
        if (!a) return []
        const list = [() => posterFor(lang, a)]
        if (lang === 'en')
            list.push(() =>
                posterFor(
                    lang,
                    `${a.replace(/ \((?:TV series|miniseries)\)$/, '')} season 1`
                )
            )
        return list
    }
    const prefix =
        slug === 'star-wars' && !/star wars/i.test(e.title) ? 'Star Wars: ' : ''
    const tv =
        lang === 'en'
            ? [
                  () =>
                      tvmaze(
                          prefix + e.title.replace(/ \(Season.*\)$/, ''),
                          e.year
                      ),
              ]
            : []
    return [wiki, tv]
}

const manifest = fs.existsSync(MANIFEST)
    ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
    : {}
const slugs = fs
    .readdirSync(CONTENT)
    .filter((s) => fs.existsSync(path.join(CONTENT, s, 'plan.md')))
    .sort()

for (const slug of slugs) {
    for (const e of entries(slug)) {
        const key = `${slug}/${e.title}${e.year ? ` (${e.year})` : ''}`
        if (manifest[key] && !REFRESH) continue
        const [wiki, tv] = candidates(slug, e, key)
        if (!wiki) continue
        const rel = `${slug}/${slugify(e.title)}${e.year ? `-${e.year}` : ''}.jpg`
        const out = path.join(OUT, rel)
        fs.mkdirSync(path.dirname(out), { recursive: true })
        let found = null
        const tried = []
        try {
            for (const find of [...(await wiki()), ...tv]) {
                const p = await find()
                if (!p) continue
                const [w, h] = await save(p.url, out)
                // 16:9 title cards and logos aren't posters
                if (h / w < 0.7) {
                    tried.push(`${p.source} (title card)`)
                    continue
                }
                found = p
                break
            }
        } catch (err) {
            console.log(`  ! ${key}: ${err.message}`)
            continue
        }
        if (!found) {
            if (fs.existsSync(out)) fs.unlinkSync(out)
            console.log(
                `  – ${key}: no poster${tried.length ? ` — ${tried.join(', ')}` : ''}`
            )
            continue
        }
        manifest[key] = { src: `/posters/${rel}`, source: found.source }
        console.log(`  ✓ ${key} ← ${found.source}`)
    }
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
