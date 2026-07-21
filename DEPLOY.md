# Deploying Roma → babuban.com

One-time setup, in order. The Vercel project is named `roma` (codename); the public site is 八部半 at babuban.com.

## 1. Vercel project

```bash
vercel link          # create/link project "roma"
```

## 2. Neon Postgres (Vercel Marketplace)

Vercel Dashboard → Storage → Create → **Neon Postgres**, attach to the `roma` project. This injects `DATABASE_URL` (pooled). Add a second env var `DATABASE_URL_UNPOOLED` with Neon's **direct** (non-pooler) connection string — migrations must bypass pgbouncer.

## 3. Vercel Blob

Dashboard → Storage → Create → **Blob**, attach to the project. This injects `BLOB_READ_WRITE_TOKEN`. Image uploads switch from `public/uploads` to Blob automatically when the token is present.

## 4. Remaining env vars (Production)

```bash
BETTER_AUTH_SECRET   # openssl rand -base64 32
BETTER_AUTH_URL      # https://babuban.com
NEXT_PUBLIC_SITE_URL # https://babuban.com
RESEND_API_KEY       # REQUIRED in production — password reset throws without it (a live
                     # reset token must never reach the logs). Only dev falls back to console.
EMAIL_FROM           # optional — e.g. 八部半 <noreply@babuban.com>
TMDB_API_TOKEN       # optional — enables the metadata-import button in /admin/films/new
```

## 5. Migrations + seed (run locally against Neon)

Never run migrations inside the Vercel build. From a local checkout:

```bash
DATABASE_URL=<neon-pooled> DATABASE_URL_UNPOOLED=<neon-direct> bun run db:migrate
DATABASE_URL=<neon-pooled> SEED_ADMIN_EMAIL=<you> SEED_ADMIN_PASSWORD=<strong> bun run db:seed
```

## 6. Deploy + domain

```bash
vercel deploy --prod
```

Dashboard → Domains → add `babuban.com` (+ `www` redirect).

## 7. Post-deploy checks

- `/` 308-redirects to `/zh`; `/sitemap.xml` lists only published slugs; `/robots.txt` blocks /admin.
- Sign in with the seeded admin → `/admin` loads; upload an image → it lands in Blob (URL on `*.public.blob.vercel-storage.com`).
- Publish a film → its public page appears without a redeploy.
- Share a film URL in a social-card debugger → OG image renders (八部半 wordmark + original title).
- Change the seeded admin password immediately.

## Ongoing schema changes

```bash
bun run db:generate   # after editing src/db/schema — review the SQL in drizzle/
bun run db:migrate    # against Neon (direct URL), before deploying the code that needs it
```

## Ongoing content changes

For a batch of new films/people/lists added to `src/db/seed-data/`.

```bash
# 0. Get production credentials locally; delete the file when you are done.
vercel env pull --environment=production .env.production.local

# 1. Merge to main; Vercel auto-deploys. Site unchanged — the DB has no new content yet.

# 2. Apply any schema change, and the seed baseline it depends on.
bun --env-file=.env.production.local run db:migrate

# 3. Seed. This is the whole content deploy: new films, people and lists, their tag
#    junctions, and any tag the release introduces.
bun --env-file=.env.production.local --conditions=react-server run src/db/seed-content.ts
#    Read the last lines: "Tags: created N tag(s), linked N junction(s)" and
#    "Newly inserted — people:N films:N …" plus "Images stored:N skipped:N".
#    films:0 means a slug collision. Any "✗" line names a film or person whose TMDB
#    lookup failed and needs its id pinned by hand. A "left alone" line is not a
#    problem — it reports tags an editor removed, which the seeder will not restore.

# 4. Confirm the homepage 近期收录 strip is what you intended (it is the 4 newest).
#    Source the prod env first — an unset/empty connection string does NOT make psql fail,
#    it falls back to libpq defaults and quietly queries your LOCAL database, so this check
#    would "pass" against the wrong data.
set -a; source .env.production.local; set +a
psql "$DATABASE_URL" -c "select slug, published_at from films order by published_at desc limit 6;"

# 5. Changes to an existing row that are NOT tags — a corrected note, a list's sortOrder —
#    still need their own step, because everything else is onConflictDoNothing:
#      prose    → bun run src/db/resync-content.ts --films=… --apply
#      lists    → /admin (moving the featured list, sortOrder 0)
#      metadata → bun run src/db/backfill-metadata.ts [--films=…] --apply
#                 (external ids, isSilent, restoration notes — ADR 0016. Dry-run first:
#                 omit --apply. Without --films it sweeps the whole seed corpus, which is
#                 right for a rollout; once editors correct ids in /admin, always pass an
#                 explicit --films list so seed-data can't silently revert their fixes.)

# 6. Redeploy (dashboard "Redeploy", or an empty commit) so listings, sitemap and person
#    pages rebuild against the populated database.
```

**Three things about production are not obvious and will bite:**

1. `seed-content.ts` inserts with `status: "published"`, so content is **live the moment
   the transaction commits** — there is no draft step. But the whole core seed, including
   its publish-gate checks, is that one transaction: if a gate fails, or a tag conflict is
   found, **nothing is written at all** and the run is safe to repeat once you have fixed
   it. A failed run never leaves the database half-seeded.
   While it runs it holds row locks on the seed corpus, so `/admin` saves block until it
   commits — under a second for a text-only run. Images are fetched afterwards, outside
   the transaction, so a missing poster never blocks or rolls back the content.
2. It runs outside Next and cannot call `revalidate.ts`. `/[lang]/film/[slug]` has
   `dynamicParams: true` so a new film's own page renders on demand, but every **listing**
   surface (`/zh`, `/zh/films`, `/zh/lists`, `/sitemap.xml`, person pages) is prerendered
   and stale. **The redeploy is the invalidation mechanism.**
3. Everything except tags is `onConflictDoNothing`. Re-running never fixes an existing
   row, so edits to *existing* seed rows — a corrected note, a list's `sortOrder` — apply
   only to a fresh database unless you take step 5.

**Why tags are the exception.** They are the one thing the seeder can decide safely on its
own, because `seed_tag_baseline` / `seed_film_tag_baseline` record what seed-data asserted
at the last run. That third input is what separates "this release adds a tag" from "an
editor removed one" — states that are otherwise identical (ADR 0014). So the seeder creates
tags a release introduces, links them on new and existing films alike, and leaves anything
an editor removed exactly where they left it, saying so.

The baseline is bootstrapped by its migration from whatever the database already holds. On a
database where an editor removed a tag *before* that migration, the removal is invisible and
will be re-applied once — confirm the target's tags match seed-data before migrating if that
is possible.

Then run the §7 post-deploy checks, plus: new slugs present in `/sitemap.xml` in both
locales; `/en/film/<new-slug>` is a real page and not a translation-pending stub;
`/zh/films?tag=<new-tag>` returns results; `/zh/search-index.json` contains the new titles.
