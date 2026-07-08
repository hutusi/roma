# 0005 — Editorial pages fully SSG; user state only in client islands

Status: accepted (2026-07-06)

## Context

Editorial pages (films, directors, lists, home) are read-heavy and rarely change; user state (marks, follows) is per-viewer. Server-rendering user state onto cached pages leaks it across users.

## Decision

Editorial routes use `generateStaticParams` + on-demand rendering; publish actions invalidate through the single map in `src/lib/revalidate.ts` (`updateTag` + `revalidatePath`), so publishing goes live without a redeploy. Per-user UI (mark buttons, follow button, header menu) is client islands fetching `/api/me/state` with `Cache-Control: no-store`. Only genuinely per-user pages (`/u/*`, `/me/*`, `/account`) are dynamic. `cacheComponents` deliberately not enabled in v1.

## Consequences

- Cached HTML never contains user state — verified by a two-account e2e test.
- Islands cost one extra client fetch per page; acceptable, and keeps pages CDN-cacheable.
- Draft filtering must happen in the public query layer (`src/db/queries/public.ts`), since cached pages can't rely on request-time checks.
