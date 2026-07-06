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
| `bun run lint` | ESLint |
| `bun run db:generate` | Generate SQL migrations from schema changes |
| `bun run db:migrate` | Apply migrations |
| `bun run db:seed` | Seed the first admin user |

## Structure

- `src/app/(site)` — public site (八部半)
- `src/app/(admin)/admin` — editorial backend (admin/editor roles)
- `src/db/schema` — Drizzle schema, the source of truth for all content
- `src/components/site` — design-system components (title cards, Academy-ratio frames)
- `src/components/tiptap` — the shared editor/renderer contract for rich text
