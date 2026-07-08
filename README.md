# Roma

**Roma** is the codename for [babuban.com](https://babuban.com) — **八部半 (Babuban)**, a Chinese-language curatorial site for classic cinema, with a focus on black-and-white film. Both names are Fellini's: *Roma* (1972) for the project, *8½* (1963) for the product.

Curation-first, in the spirit of the Criterion Collection or MUBI — not a database. Editorial content (curated lists, film pages, director pages) is the core product; user features (accounts, watch marks, personal lists, follows) are deliberately light.

> The codename stays in the repo, `package.json`, and internal docs. Everything user-facing says 八部半 / Babuban.

## Stack

TypeScript · Next.js (App Router) · Tailwind CSS v4 · Drizzle ORM + Neon Postgres · better-auth · Tiptap · shadcn/ui · Bun (package manager) · Vercel (hosting + Blob storage)

## Development

```bash
bun install
cp .env.example .env.local   # fill in secrets
bun dev
```

| Script | Purpose |
|---|---|
| `bun dev` | Dev server |
| `bun run build` | Production build |
| `bun run lint` / `lint:fix` / `format` | Biome (lint + format) |
| `bun run typecheck` | `next typegen && tsc --noEmit` |
| `bun test src` | Unit tests (pure logic) |
| `bun run test:e2e` | Playwright vs a production build on an ephemeral `roma_test` DB |
| `bun run db:generate` | Generate SQL migrations from schema changes |
| `bun run db:migrate` | Apply migrations |
| `bun run db:seed` | Seed the first admin user |

## QA & docs

CI runs cheap checks (`checks.yml`) on every PR and the full browser suite (`e2e.yml`) on pushes to `main` — a red main run is fixed forward, never reverted or silenced. Architecture context lives in [`docs/CONTEXT.md`](docs/CONTEXT.md) and decision records in [`docs/adr/`](docs/adr/); the editor-facing handbook is inside the app at `/admin/handbook`.

## Structure

- `src/app/(site)` — public site (八部半)
- `src/app/(admin)/admin` — editorial backend (admin/editor roles)
- `src/db/schema` — Drizzle schema, the source of truth for all content
- `src/components/site` — design-system components (title cards, Academy-ratio frames)
- `src/components/tiptap` — the shared editor/renderer contract for rich text
