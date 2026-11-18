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

## Deploy

Static export served by Cloudflare Workers:

```bash
npm run build && npx wrangler deploy
```
