<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project conventions (Roma / babuban.com)

Read `docs/CONTEXT.md` first; decisions with rationale are in `docs/adr/`.

- **Naming**: Roma is the repo codename and must NEVER appear in user-facing output (UI strings, metadata, emails, sitemap). The product is 八部半 / Babuban.
- **Rich text**: `src/components/tiptap/extensions.ts` is the contract between the admin editor and the public renderer — extend both sides together or not at all. Never render stored content with `dangerouslySetInnerHTML`.
- **Authorization**: call `requireUser/requireEditor/requireAdmin` (from `src/lib/auth-guards.ts`) at the top of every admin page AND every mutating server action. `src/proxy.ts` is UX-only. Server actions return `ActionResult` objects instead of throwing (prod masks thrown messages).
- **Caching**: editorial pages stay fully SSG; per-user state only via client islands hitting `/api/me/state`. On publish/update, invalidate through `src/lib/revalidate.ts` — never hand-roll tag/path lists. Draft filtering happens in `src/db/queries/public.ts`.
- **Migrations**: edit `src/db/schema/`, then `bun run db:generate` → review the SQL → `bun run db:migrate`. `db:push` is dev-only. CI fails on schema/migration drift.
- **Fonts**: never introduce Google Fonts (build- or runtime) — mainland-China audience. See ADR 0002.
- **Storage**: all file storage goes through `src/lib/storage.ts`; no direct Vercel Blob calls elsewhere (ADR 0008 preserves the Cloudflare exit).
- **QA**: `bun run lint` (Biome), `bun run typecheck`, `bun test src`, `bun run test:e2e` (needs local Postgres; uses ephemeral `roma_test`; kill stale :3105 servers first). Verify locally before landing on main — main pushes auto-deploy, and the e2e workflow only runs post-merge (fix-forward policy, ADR 0007).
- **Commits**: Conventional Commits with a why-body; no Co-Authored-By trailers; no AI attribution in PR descriptions.
