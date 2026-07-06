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

```
BETTER_AUTH_SECRET   # openssl rand -base64 32
BETTER_AUTH_URL      # https://babuban.com
NEXT_PUBLIC_SITE_URL # https://babuban.com
RESEND_API_KEY       # optional — password-reset email; without it resets log to the console
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

- `/` 200; `/sitemap.xml` lists only published slugs; `/robots.txt` blocks /admin.
- Sign in with the seeded admin → `/admin` loads; upload an image → it lands in Blob (URL on `*.public.blob.vercel-storage.com`).
- Publish a film → its public page appears without a redeploy.
- Share a film URL in a social-card debugger → OG image renders (八部半 wordmark + original title).
- Change the seeded admin password immediately.

## Ongoing schema changes

```bash
bun run db:generate   # after editing src/db/schema — review the SQL in drizzle/
bun run db:migrate    # against Neon (direct URL), before deploying the code that needs it
```
