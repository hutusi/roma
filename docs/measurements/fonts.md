# CJK font cost per page

Cold-cache bytes of Noto Serif SC woff2 a prerendered page needs, from
`bun run fonts:report` (scripts/font-report.ts) against a production
build of the full corpus. "Before" is the Fontsource unicode-range slicing
ADR 0002 shipped; "after" is the generated "Babuban Serif SC" subset of
ADR 0018. "Late fallback" is Fontsource slices still fetched after
hydration for glyphs the subset lacks — it should stay near zero; when it
grows, run `bun run fonts:generate`.

Measured 2026-10-21:

| Pages | n | Before (median) | After (median) | After, late fallback (median) |
|---|---|---|---|---|
| zh film pages | 74 | 963 KB / 25 files | 286 KB / 34 files | 0 KB (0 glyphs) |
| zh person pages | 63 | 883 KB / 23 files | 261 KB / 26 files | 0 KB (0 glyphs) |
| zh list pages | 8 | 1052 KB / 27 files | 280 KB / 30 files | 0 KB (0 glyphs) |
| zh index pages | 7 | 594 KB / 17 files | 204 KB / 15 files | 0 KB (0 glyphs) |
| en pages | 154 | 298 KB / 8 files | 68 KB / 5 files | 0 KB (0 glyphs) |

Render-blocking CJK @font-face CSS: 66.2 KB gz before → 11.9 KB gz after.
Most late-fallback glyphs: zh/film/la-strada (1).
