# CONTEXT

One-page orientation for contributors (human or agent). Decisions with rationale live in [`docs/adr/`](./adr/); editor-facing rules live at `/admin/handbook` in the app.

## What this is

**Roma** (codename, never user-facing) builds **八部半 / Babuban** (babuban.com): a Chinese-language curatorial site for classic cinema — black-and-white is a house preference, not the catalogue's boundary, and Chinese-language film is a first-class axis rather than a regional footnote (ADR 0015). Curation-first with light UGC — Criterion/MUBI in spirit, not Douban/IMDb. 收录即推荐: inclusion *is* the recommendation.

## Domain language

| Term | Meaning |
|---|---|
| 影片 (film) | A curated film — never an exhaustive database entry. Publishing requires a 200–500 code-point 编辑札记 and ≥1 director. Physical attributes are explicit booleans/columns (`isBlackAndWhite`, `isSilent`, aspect ratio, runtime, countries), plus optional 修复版本 notes (`restorationNote`/`restorationNoteEn`). Carries four optional external ids (TMDB/IMDb/豆瓣/Wikidata) stored bare — URLs built only in `src/lib/external-ids.ts`; the page shows just a discreet 外部链接 pair (豆瓣-first on /zh, IMDb-first on /en), the rest feeds JSON-LD `sameAs` (ADR 0016). |
| 人物 (person) | A curated human — director, actor, or both; ONE row and one page per person (`people` table). `primaryRole` picks the canonical URL segment (`/director/` vs `/actor/`); the other segment 308s to it (ADR 0013). Directing credits live in `film_directors`; the 演员表 is curated `film_cast` rows (denormalized name + 角色, optional `personId` link). 收录即推荐 applies to people too: cast rows exist for every credit, but person rows/pages only for people the editors curate. |
| 编辑札记 | The editorial note; plain text, counted in Unicode code points (CJK-correct). The heart of a film page. |
| 译名 | Title variants: 大陆 (primary), 港, 台, plus original and English. Explicit columns, not a child table. |
| 标签 (tag) | Curated bilingual vocabulary (slug + 中文名 + English name, both required), films only. Editors manage it in `/admin/tags`; the film form picks from it — never free text. No public `/tag/` URLs: tags surface as chips on film pages and a facet on `/films`. Black-and-white is a film attribute (`isBlackAndWhite`), never a tag (ADR 0014). |
| 片单 (curated list) | THE core product. Theme + intro essay + per-film 入选理由 + deliberate ordering ("顺序即立场"). URL namespace `/list/` is editorial-only. |
| User list | Deliberately thinner (title, description, ordered films) at `/u/[username]/list/[id]` — never under `/list/`. |
| 看过 / 想看 | User marks; one row per (user, film), each overwrites the other. |
| Roles | `admin` > `editor` > `user`. "editor" is app-level (our guards), not a better-auth access-control role. |
| 英文版 (English edition) | Per-entity `*En` fields + `statusEn`. Listings/sitemap/RSS/JSON-LD on `/en` expose only the en-published subset (en-visible ⇔ published in zh AND en), but detail URLs never 404 for en-pending entities — they render a noindex translation-pending stub linking to the zh edition (ADR 0012). English notes gate on 120–350 words. Users carry an optional `locale` ("zh"/"en", NULL for pre-column accounts) captured at sign-up and editable in /account; the reset email is single-language when the locale is known, bilingual otherwise. |

## System map

- `src/app/[lang]` — one tree serves both locales at symmetric `/zh` and `/en` URLs (ADR 0012); `/` and launch-era root URLs 308 to `/zh` via `next.config.ts`. Pages read `params.lang` through `parseLocale()`; shared components take a `locale` prop, shared chrome reads `src/i18n` dictionaries (server-only; islands get labels as props). Editorial pages are **fully SSG** — no proxy or locale detection in the serving path; per-user state only ever arrives through client islands fetching `/api/me/state` (no-store). Drafts 404.
- `src/app/admin` — the admin, zh-only, as its own root-layout tree (shares `DocumentShell` with the site).
- Admin is custom (no CMS), guarded by `requireEditor/requireAdmin` on **every page and every mutating server action**; `src/proxy.ts` is a UX-only cookie redirect. Editors dual-author the 英文版 in the same forms.
- `src/db/schema` — source of truth. Migrations: `db:generate` → review SQL → `db:migrate`; `db:push` is dev-only. CI fails if schema and `drizzle/` drift.
- `src/components/tiptap/extensions.ts` — the **contract** between the admin editor and the public static renderer. Extend both sides together or not at all.
- `src/lib/revalidate.ts` — the single seam every editorial mutation (including media) invalidates through; readers see changes without redeploys. It sweeps the whole public tree (`/[lang]` layout + `/sitemap.xml` + both `rss.xml`) rather than mapping entity → pages: the graph is densely cross-linked, so an accurate map is most of the read layer restated, and the map it replaced under-invalidated on every edge it forgot. Paths are the only mechanism — ADR 0005 leaves `cacheComponents` off, so there is nothing to `cacheTag`. IndexNow notification is a separate opt-in (`{ notify: true }`), reserved for rows that actually have a public URL.
- `src/lib/seo.ts` — every indexable page composes canonical + hreflang + og/twitter identity by spreading `seoMetadata()`; never hand-roll `alternates` on a page. It deliberately sets no titles/descriptions/images — Next inherits those and merges the file-convention OG images.
- `scripts/generate-brand-assets.ts` → `src/assets/brand/` — the 8½ monogram (live) and 红印章 seal (candidate; compare in `src/assets/brand/preview.html`), plus every icon (favicon/apple/manifest/header paths). All generated and deterministic: edit the script, `bun run brand:generate` — never the assets.
- `src/lib/storage.ts` — the storage seam (Vercel Blob in prod, `public/uploads` in dev). Keep all storage behind it (ADR 0008).
- `src/db/locks.ts` — editorial mutations serialize on `SELECT … FOR UPDATE` row locks taken ONLY through this module, in the canonical order **people → tags → films → lists** (multi-row helpers sort by id). Acquiring locks in any other order can deadlock. Gates and writes run inside one transaction; `revalidate*`/IndexNow run only after commit.
- `src/lib/rum-retention.ts` — opportunistic RUM maintenance. Successful beacons schedule a post-response cleanup; an atomic daily claim retains raw events for 90 days.
- `src/db/seed-data/` + the content CLIs — the editorial corpus is checked-in TypeScript, written by `db:seed:content`. A content deploy is `db:migrate && db:seed:content`: it inserts films/people/lists (`onConflictDoNothing`, so admin edits survive) **and** decides tags on its own. The whole core — locks, conflict gate, every insert, and the publish-gate assertions — is a single transaction, so a failed gate publishes nothing; images are fetched after it commits, since they are network I/O and best-effort. It can do that safely because `seed_tag_baseline`/`seed_film_tag_baseline` record what seed-data asserted at the last run — the third input that separates "this release adds a tag" from "an editor removed one", states which are otherwise identical. So it creates tags a release introduces, links them on new and existing films alike, and never restores one an editor removed (ADR 0014) — with a single documented exception: the baseline's bootstrap migration cannot see removals made before it ran, so those are re-applied once. The rules are pure functions in `src/db/tag-plan.ts`, unit-tested because the script around them cannot be. Everything else about an *existing* row still needs an explicit tool: `resync-content.ts --films=…` overwrites prose for named slugs, `backfill-en.ts` fills NULL/draft English fields, `link-cast.ts` links existing cast rows to people. All run **outside Next**, so none can call `revalidate.ts` — redeploy after writing. See DEPLOY.md's content runbook.

## QA

| Command | What |
|---|---|
| `bun run lint` / `lint:fix` / `format` | Biome (lint + format in one tool) |
| `bun run typecheck` | `next typegen && tsc --noEmit` |
| `bun test src` | Unit tests (pure logic) |
| `bun run test:e2e` | Playwright vs a production build on an ephemeral `roma_test` DB — kill any stale server on :3105 first |

CI: `checks.yml` on every PR and main push; `e2e.yml` on main pushes + manual dispatch only. **A red main e2e run is handled fix-forward** — ship the fix, don't revert, never disable the suite (ADR 0007).

## Non-negotiables

- The Roma codename never appears in user-facing output.
- No Google Fonts at build or runtime (mainland-China audience) — fonts are self-hosted slices (ADR 0002).
- Tiptap JSON reaches HTML only through `src/components/tiptap/render.tsx`. No `dangerouslySetInnerHTML`.
- Image uploads: extension derives from validated MIME; `credit` is mandatory (licensing posture).
