# 0018 — A corpus-derived CJK subset ahead of the Fontsource slices

Status: accepted (2026-10-22). Supersedes ADR 0002's sizing claim and its "slices are the whole story" posture; ADR 0002's sourcing rule (self-hosted, never Google, never fetched at build or run time) stands.

## Context

ADR 0002 expected "per-page font payload in the tens of KB" from Fontsource's ~100 unicode-range slices per weight, at "~3KB" a slice. Measured against a production build of the full corpus, the slices are 30–45 KB each, and a zh page touches 17–27 of them across the two weights: **963 KB** median for a film page, 1,052 KB for a list page, 298 KB even for an `/en` page (brand, switchers, the zh title table). The two Noto stylesheets also put 66 KB gz of `@font-face` rules — 101 per weight, each listing woff2 and woff — on the critical path of every page. Live, `/zh/films` downloaded 53 font files, 1.06 MB.

The slicing is Google's, tuned for arbitrary Chinese text. Ours is not arbitrary: the corpus is checked in, and it uses about 2,100 distinct code points against the 16,000+ the slices cover. Paying for a slice to get one rare character from a name is the common case here, not the edge case.

## Decision

Generate a subset of Noto Serif SC that covers exactly what the public site renders, and put it ahead of Fontsource in the font stack.

- **Source.** `@fontsource/noto-serif-sc` already ships the full static font (`files/noto-serif-sc-chinese-simplified-{400,700}-normal.woff2`, 8,244 glyphs). Glyphs it lacks — Cyrillic and macron Latin in original titles, a few traditional forms, arrows — come from whichever Fontsource file covers them. Nothing is fetched, the version is pinned by `bun.lock`, and every glyph is identical to the fallback it replaces.
- **Code points.** `src/lib/font-corpus.ts` models each public page from checked-in sources — seed-data, the dictionaries, the literals of public components grouped by route — split by weight (headings and bold runs are 700). It is a model, not a crawl, so regenerating needs no build and no database.
- **Buckets.** `scripts/generate-fonts.ts` ranks code points by how many pages use them and cuts the ranking into contiguous files with a small dynamic program that minimises summed cold-load bytes across all pages, with a per-file penalty against confetti. Common characters share files every page loads and the cache reuses; rare ones sit in files only their pages pay for. The commonest buckets (≥90% of zh pages, 64 KB budget) are preloaded on zh pages only.
- **Emission.** Plain `@font-face` CSS (one family, "Babuban Serif SC", one face per file with an exact `unicode-range`) and content-hashed files under `public/fonts/`, served `immutable`. Not `next/font/local`: each call there is its own family, and a family holding only a 400 face would synthesise bold for 700 text instead of falling through.
- **Fallback.** Fontsource Noto Serif SC stays in the stack behind the subset, but its stylesheets load in an async chunk after hydration (`FontFallback`). A character the subset lacks — typically one an editor added after the last generation — shows briefly in the system serif, then in the same Noto glyph.
- **Guards.** `bun test` fails when seed-data or public UI copy uses a glyph the committed subset doesn't cover (and Noto has); the message says to run `bun run fonts:generate`. `bun run fonts:report` measures real per-page bytes from `.next/` and writes `docs/measurements/fonts.md`.

## Consequences

- Median cold font bytes: zh film pages 963 → 286 KB, person 883 → 261 KB, list 1,052 → 280 KB, index pages 594 → 204 KB, `/en` 298 → 68 KB. Render-blocking CJK `@font-face` CSS: 66 → 12 KB gz. Later pages in a visit reuse the shared buckets, where every new page used to pull new slices.
- More, smaller files per page (≈30 against ≈25). Over HTTP/2 that is cheap, and the per-file penalty in the optimiser is the knob if it stops being.
- Content releases that add characters should regenerate in the same PR; the coverage test enforces it for seed-data. Admin-only edits can't be enforced and degrade to a late swap, never to a missing glyph.
- The bucket model counts all of a route's UI copy in both weights, which over-fetches bold glyphs a little. Refine the model, not the output — the files are generated and never hand-edited.
- OG images still vendor their own Noto slices (`src/assets/og/`); out of scope here.
