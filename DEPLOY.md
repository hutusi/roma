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

For a batch of new films/people/lists added to `src/db/seed-data/`. Pure data — no
migration; confirm `drizzle/` is untouched in the diff.

**Three things about production are not obvious and will bite:**

1. `seed-content.ts` inserts with `status: "published"`, so content is **live the moment
   the transaction commits** — there is no draft step.
2. It runs outside Next and cannot call `revalidate.ts`. `/[lang]/film/[slug]` has
   `dynamicParams: true` so a new film's own page renders on demand, but every **listing**
   surface (`/zh`, `/zh/films`, `/zh/lists`, `/sitemap.xml`, person pages) is prerendered
   and stale. **The redeploy is the invalidation mechanism.**
3. Everything is `onConflictDoNothing`. Re-running never fixes an existing row — that is
   `resync-content.ts --films=…`. It also means edits to *existing* rows in seed data
   (a list's `sortOrder`, a corrected note) apply only to a fresh database.

New films get their tag junctions from the seeder itself. It will **refuse to start** if an
incoming film references a tag the admin-owned vocabulary does not hold, naming the slugs —
create those first. Nothing is written on that refusal, so the run stays replayable.

```bash
# 1. Merge to main; Vercel auto-deploys. Site unchanged — the DB has no new content yet.

# 2. Create any new tags the batch introduces. Always explicit: an absent slug might be new,
#    or one an editor deliberately retired, and the database cannot tell them apart.
#    Do this in /admin/tags, or:
bun --env-file=.env.production.local run src/db/apply-tags.ts \
  -- --create-tags=slug-a,slug-b            # dry run first
bun --env-file=.env.production.local run src/db/apply-tags.ts \
  -- --create-tags=slug-a,slug-b --apply

# 3. Seed production from a local checkout of main. New films arrive WITH their junctions.
bun --env-file=.env.production.local --conditions=react-server run src/db/seed-content.ts
#    Read the last lines: "Tags: linked N junction(s) …" and
#    "Newly inserted — people:N films:N …" plus "Images stored:N skipped:N".
#    films:0 means a slug collision. Exit 1 means a gate caught something — the message says
#    what; fix and re-run, onConflictDoNothing makes that safe. Any "✗" line names a film or
#    person whose TMDB lookup failed and needs its id pinned by hand.

# 4. Confirm the homepage 近期收录 strip is what you intended (it is the 4 newest).
psql "$PROD_URL" -c "select slug, published_at from films order by published_at desc limit 6;"

# 5. Only if you are backfilling films that PREDATE their tags — name them explicitly.
#    Not needed for films step 3 just created.
bun --env-file=.env.production.local run src/db/apply-tags.ts -- --films=slug-a,slug-b --apply

# 6. Any change to an EXISTING row must be made in /admin, not by re-seeding — e.g. moving the
#    featured list (sortOrder 0). Admin actions do call revalidate.ts, which sweeps the tree.

# 7. Redeploy (dashboard "Redeploy", or an empty commit) so listings, sitemap and person
#    pages rebuild against the populated database.
```

`apply-tags.ts` acts **only on what you name**. With no flags it does nothing. It will not
create a tag you did not list, and will not touch a film you did not list — because neither
"this tag is missing" nor "this film has no tags" distinguishes a gap from an editorial
decision (ADR 0014 amendment).

Then run the §7 post-deploy checks, plus: new slugs present in `/sitemap.xml` in both
locales; `/en/film/<new-slug>` is a real page and not a translation-pending stub;
`/zh/films?tag=<new-tag>` returns results; `/zh/search-index.json` contains the new titles.
