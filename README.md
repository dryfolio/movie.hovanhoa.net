# movie.hovanhoa.net

A watch log for the film franchises I follow — every entry in release order, ticked off one at a time. Part of the `*.hovanhoa.net` family (same design system as [hovanhoa.net](https://hovanhoa.net) and [book.hovanhoa.net](https://book.hovanhoa.net)).

## Development

```bash
npm install
npm run dev
```

## Updating the log

Every list is a plain markdown checklist in `content/<slug>/plan.md`:

```md
# Dune - Kế hoạch xem toàn bộ

- [x] Dune: Part One (2021)
- [ ] Dune: Prophecy (series, 2024)
- [ ] Dune: Part Three (2026 - chưa phát hành)
```

- Tick `[x]` when you've watched something — that's the only edit needed.
- The trailing `(…)` is metadata: a year or range (`2008-2020`, `2019-`), `series` / `special`, and `chưa phát hành` / `dự kiến` for announced entries. Anything dated after the current year also counts as announced.
- `## ` headings split a list into groups (Marvel phases, Star Wars films/series).
- A new folder shows up automatically; add it to `META` in `src/data/movies.ts` for its description and position.

## Posters

```bash
node scripts/fetch-posters.mjs   # macOS (uses sips)
```

Looks up each entry on Wikipedia (vi.wikipedia for `phim-vietnam`) and takes the infobox poster, falling back to the article's "season 1" page, then [TVmaze](https://www.tvmaze.com/api) (Disney+/HBO series whose Wikipedia infobox is only a logo), then IMDb's search suggestions (recent Vietnamese films, announced sequels — pin English title + year in `IMDB`). TVmaze and IMDb results must match the release year. It and saves a ≤420px JPEG to `public/posters/<slug>/` plus a manifest in `src/data/posters.json`. Only missing entries are fetched; `--refresh` redoes everything. Wide 16:9 title cards are skipped, and entries without any poster get a typographic one (title in the display serif). When the search lands on the wrong article, pin the right one in `OVERRIDES` at the top of the script. Run it after adding a new film, then commit the images.

## Deploy

Static export served by Cloudflare Workers:

```bash
npm run build && npx wrangler deploy
```
