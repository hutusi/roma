# CONTEXT

One-page orientation for contributors (human or agent). Decisions with rationale live in [`docs/adr/`](./adr/); editor-facing rules live at `/admin/handbook` in the app.

## What this is

**Roma** (codename, never user-facing) builds **八部半 / Babuban** (babuban.com): a Chinese-language curatorial site for classic cinema, black-and-white first. Curation-first with light UGC — Criterion/MUBI in spirit, not Douban/IMDb. 收录即推荐: inclusion *is* the recommendation.

## Domain language

| Term | Meaning |
|---|---|
| 影片 (film) | A curated film — never an exhaustive database entry. Publishing requires a 200–500 code-point 编辑札记 and ≥1 director. |
| 编辑札记 | The editorial note; plain text, counted in Unicode code points (CJK-correct). The heart of a film page. |
| 译名 | Title variants: 大陆 (primary), 港, 台, plus original and English. Explicit columns, not a child table. |
| 片单 (curated list) | THE core product. Theme + intro essay + per-film 入选理由 + deliberate ordering ("顺序即立场"). URL namespace `/list/` is editorial-only. |
| User list | Deliberately thinner (title, description, ordered films) at `/u/[username]/list/[id]` — never under `/list/`. |
| 看过 / 想看 | User marks; one row per (user, film), each overwrites the other. |
| Roles | `admin` > `editor` > `user`. "editor" is app-level (our guards), not a better-auth access-control role. |
| 英文版 (English edition) | Per-entity `*En` fields + `statusEn`. `/en` is a curated subset: en-visible ⇔ published in zh AND en; untranslated list members render unlinked (ADR 0010). English notes gate on 120–350 words. |

## System map

- `src/app/(zh)` — the Chinese site (root URLs, unchanged since launch): `(site)` public pages + `(admin)/admin`. Editorial pages are **fully SSG**; per-user state only ever arrives through client islands fetching `/api/me/state` (no-store). Drafts 404.
- `src/app/en` — the English edition: a second root-layout tree (NOT a `[lang]` segment — no proxy in the editorial serving path). Renders the en-published subset only; shared components take a `locale` prop, shared chrome reads `src/i18n` dictionaries (server-only; islands get labels as props).
- Admin is custom (no CMS), guarded by `requireEditor/requireAdmin` on **every page and every mutating server action**; `src/proxy.ts` is a UX-only cookie redirect. Editors dual-author the 英文版 in the same forms.
- `src/db/schema` — source of truth. Migrations: `db:generate` → review SQL → `db:migrate`; `db:push` is dev-only. CI fails if schema and `drizzle/` drift.
- `src/components/tiptap/extensions.ts` — the **contract** between the admin editor and the public static renderer. Extend both sides together or not at all.
- `src/lib/revalidate.ts` — the single map from entity → cache invalidation. Publish actions call it; readers see changes without redeploys.
- `src/lib/storage.ts` — the storage seam (Vercel Blob in prod, `public/uploads` in dev). Keep all storage behind it (ADR 0008).

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
