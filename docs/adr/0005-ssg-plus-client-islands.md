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

## Amendment (2026-10-22): one session read per page

In practice the header menu and the language hint read the session through better-auth's client (`useSession`), which fired `/api/auth/get-session` on every page and again on tab focus, in parallel with the islands' `/api/me/state`. It also put the better-auth client and Radix's dropdown menu in the layout chunk every page loads, and each island treated a failed read as "signed out", so a signed-in reader was told to sign in whenever the request failed.

Now `/api/me/state` is the only per-user read a public page makes. It returns a session summary (`name`, `username`, `role`, `locale`) along with the mark or follow for the film or list on screen. A shared client store, `src/components/site/use-me.ts`, batches every island on the page into that one request. It has three states, and `error` means unknown, never signed out. Code that changes the session (sign-in, sign-up, sign-out, account edits) calls `invalidateMe()`; better-auth's client loads only in those forms. The session cookie still slides forward: `getSession` in a route handler writes the refreshed cookie through the `nextCookies` plugin.
