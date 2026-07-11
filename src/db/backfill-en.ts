/**
 * One-off, idempotent backfill of the English editions into an existing
 * database. The content seeder (`seed-content.ts`) inserts with
 * `onConflictDoNothing`, so it can never fill English fields into rows that
 * were seeded before the English content was authored — which is exactly the
 * state of production. This script reads the same `seed-data/` corpus and
 * UPDATEs existing rows by slug, publishing each English edition.
 *
 * Safety and idempotency:
 *   - Default is a DRY RUN. It prints the target DB host and what it would
 *     change, and writes nothing. Pass `--apply` to write.
 *   - Every update is guarded so it only touches a row whose English field is
 *     still NULL and whose statusEn is still 'draft'. A re-run is therefore a
 *     no-op, and it never clobbers an edition later edited through the admin.
 *   - `publishedEnAt` is copied from each row's own `publishedAt`, so /en
 *     recency mirrors the zh site's order rather than the moment of backfill.
 *
 * Run (local):  bun --conditions=react-server run src/db/backfill-en.ts [--apply]
 * Run (prod):   bun --env-file=.env.production.local --conditions=react-server \
 *                 run src/db/backfill-en.ts            # dry run first
 *               bun --env-file=.env.production.local --conditions=react-server \
 *                 run src/db/backfill-en.ts --apply    # then write
 *
 * The `--conditions=react-server` flag matches `db:seed:content`: it makes the
 * `server-only` import (reached transitively) resolve to its no-op variant.
 */
import { and, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { db } from "./index";
import { curatedListItems, curatedLists, directors, films } from "./schema";
import { seedDirectors } from "./seed-data/directors";
import { seedFilms } from "./seed-data/films";
import { seedLists } from "./seed-data/lists";

const APPLY = process.argv.includes("--apply");

/**
 * The English edition is published as contemporaneous with its zh edition, so
 * /en recency mirrors the order readers already know from the zh site. Copy the
 * row's own published_at (falling back to now() only if it were somehow unset).
 */
const publishedEnAt = (col: AnyPgColumn) => sql`coalesce(${col}, now())`;

function targetHost(): string {
  try {
    return new URL(process.env.DATABASE_URL ?? "").host || "(unknown)";
  } catch {
    return "(unparseable DATABASE_URL)";
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. For prod, run with --env-file=.env.production.local.");
    process.exit(1);
  }

  console.log(`\nEnglish backfill → DB host: ${targetHost()}`);
  console.log(
    APPLY ? "MODE: APPLY (writing)\n" : "MODE: dry run (no writes; pass --apply to write)\n",
  );

  // ── Films: en-authored ⇔ editorialNoteEn + titleEn present ──────────────
  const filmSeeds = seedFilms
    .map((f, index) => ({ f, index }))
    .filter(({ f }) => f.editorialNoteEn && f.titleEn);
  const filmState = filmSeeds.length
    ? await db
        .select({ slug: films.slug, statusEn: films.statusEn, noteEn: films.editorialNoteEn })
        .from(films)
        .where(
          inArray(
            films.slug,
            filmSeeds.map(({ f }) => f.slug),
          ),
        )
    : [];
  const filmCur = new Map(filmState.map((r) => [r.slug, r]));
  const filmsPending = filmSeeds.filter(({ f }) => {
    const cur = filmCur.get(f.slug);
    return cur && cur.statusEn === "draft" && cur.noteEn == null;
  });
  const filmsMissing = filmSeeds.filter(({ f }) => !filmCur.has(f.slug));

  // ── Directors: en-authored ⇔ bioEn present ──────────────────────────────
  const directorSeeds = seedDirectors.filter((d) => d.bioEn);
  const directorState = directorSeeds.length
    ? await db
        .select({ slug: directors.slug, statusEn: directors.statusEn, bioEn: directors.bioEn })
        .from(directors)
        .where(
          inArray(
            directors.slug,
            directorSeeds.map((d) => d.slug),
          ),
        )
    : [];
  const directorCur = new Map(directorState.map((r) => [r.slug, r]));
  const directorsPending = directorSeeds.filter((d) => {
    const cur = directorCur.get(d.slug);
    return cur && cur.statusEn === "draft" && cur.bioEn == null;
  });
  const directorsMissing = directorSeeds.filter((d) => !directorCur.has(d.slug));

  // ── Lists: en-authored ⇔ titleEn present ────────────────────────────────
  const listSeeds = seedLists.filter((l) => l.titleEn);
  const listState = listSeeds.length
    ? await db
        .select({
          slug: curatedLists.slug,
          statusEn: curatedLists.statusEn,
          titleEn: curatedLists.titleEn,
        })
        .from(curatedLists)
        .where(
          inArray(
            curatedLists.slug,
            listSeeds.map((l) => l.slug),
          ),
        )
    : [];
  const listCur = new Map(listState.map((r) => [r.slug, r]));
  const listsPending = listSeeds.filter((l) => {
    const cur = listCur.get(l.slug);
    return cur && cur.statusEn === "draft" && cur.titleEn == null;
  });
  const listsMissing = listSeeds.filter((l) => !listCur.has(l.slug));

  // Resolve ids for the per-item reasoningEn backfill.
  const allListSlugs = seedLists.map((l) => l.slug);
  const allItemFilmSlugs = [...new Set(seedLists.flatMap((l) => l.items.map((it) => it.filmSlug)))];
  const listIdBySlug = new Map(
    (
      await db
        .select({ id: curatedLists.id, slug: curatedLists.slug })
        .from(curatedLists)
        .where(inArray(curatedLists.slug, allListSlugs))
    ).map((r) => [r.slug, r.id]),
  );
  const filmIdBySlug = new Map(
    allItemFilmSlugs.length
      ? (
          await db
            .select({ id: films.id, slug: films.slug })
            .from(films)
            .where(inArray(films.slug, allItemFilmSlugs))
        ).map((r) => [r.slug, r.id])
      : [],
  );
  const itemBackfills = seedLists.flatMap((l) =>
    l.items.flatMap((it) => {
      if (!it.reasoningEn) return [];
      const listId = listIdBySlug.get(l.slug);
      const filmId = filmIdBySlug.get(it.filmSlug);
      return listId && filmId ? [{ listId, filmId, reasoningEn: it.reasoningEn }] : [];
    }),
  );
  // True pending count: exclude items whose reasoningEn is already set (like the
  // film/director sections), so the dry-run report reflects DB state, not seed.
  const listIds = [...listIdBySlug.values()];
  const itemsFilled = new Set(
    (listIds.length
      ? await db
          .select({ listId: curatedListItems.listId, filmId: curatedListItems.filmId })
          .from(curatedListItems)
          .where(
            and(inArray(curatedListItems.listId, listIds), isNotNull(curatedListItems.reasoningEn)),
          )
      : []
    ).map((r) => `${r.listId}:${r.filmId}`),
  );
  const itemsPending = itemBackfills.filter((it) => !itemsFilled.has(`${it.listId}:${it.filmId}`));

  // ── Report ──────────────────────────────────────────────────────────────
  const missingSuffix = (n: number) => (n ? ` (⚠ ${n} slug(s) not found in DB)` : "");
  console.log(
    `Films      — en-authored: ${filmSeeds.length}, to publish now: ${filmsPending.length}${missingSuffix(filmsMissing.length)}`,
  );
  console.log(
    `Directors  — en-authored: ${directorSeeds.length}, to publish now: ${directorsPending.length}${missingSuffix(directorsMissing.length)}`,
  );
  console.log(
    `Lists      — en-authored: ${listSeeds.length}, to publish now: ${listsPending.length}${missingSuffix(listsMissing.length)}`,
  );
  console.log(
    `List items — reasoningEn to fill: ${itemsPending.length} of ${itemBackfills.length}`,
  );
  if (filmsMissing.length) {
    console.log(`  missing film slugs: ${filmsMissing.map(({ f }) => f.slug).join(", ")}`);
  }
  if (directorsMissing.length) {
    console.log(`  missing director slugs: ${directorsMissing.map((d) => d.slug).join(", ")}`);
  }
  if (listsMissing.length) {
    console.log(`  missing list slugs: ${listsMissing.map((l) => l.slug).join(", ")}`);
  }

  if (!APPLY) {
    console.log("\nDry run complete. Re-run with --apply to write these changes.");
    process.exit(0);
  }

  // ── Apply: one transaction so a mid-run crash can't leave /en half-published.
  //    Each guard (statusEn='draft' AND <enField> IS NULL) keeps it idempotent.
  const applied = await db.transaction(async (tx) => {
    let filmsN = 0;
    for (const { f } of filmSeeds) {
      const res = await tx
        .update(films)
        .set({
          titleEn: f.titleEn ?? null,
          editorialNoteEn: f.editorialNoteEn ?? null,
          essayEn: f.essayEn ?? null,
          statusEn: "published",
          publishedEnAt: publishedEnAt(films.publishedAt),
        })
        .where(
          and(eq(films.slug, f.slug), eq(films.statusEn, "draft"), isNull(films.editorialNoteEn)),
        )
        .returning({ slug: films.slug });
      filmsN += res.length;
    }

    let directorsN = 0;
    for (const d of directorSeeds) {
      const res = await tx
        .update(directors)
        .set({
          bioEn: d.bioEn ?? null,
          careerEssayEn: d.careerEssayEn ?? null,
          statusEn: "published",
          publishedEnAt: publishedEnAt(directors.publishedAt),
        })
        .where(
          and(eq(directors.slug, d.slug), eq(directors.statusEn, "draft"), isNull(directors.bioEn)),
        )
        .returning({ slug: directors.slug });
      directorsN += res.length;
    }

    let listsN = 0;
    for (const l of listSeeds) {
      const res = await tx
        .update(curatedLists)
        .set({
          titleEn: l.titleEn ?? null,
          themeEn: l.themeEn ?? null,
          introEn: l.introEn ?? null,
          statusEn: "published",
          publishedEnAt: publishedEnAt(curatedLists.publishedAt),
        })
        .where(
          and(
            eq(curatedLists.slug, l.slug),
            eq(curatedLists.statusEn, "draft"),
            isNull(curatedLists.titleEn),
          ),
        )
        .returning({ slug: curatedLists.slug });
      listsN += res.length;
    }

    let itemsN = 0;
    for (const it of itemBackfills) {
      const res = await tx
        .update(curatedListItems)
        .set({ reasoningEn: it.reasoningEn })
        .where(
          and(
            eq(curatedListItems.listId, it.listId),
            eq(curatedListItems.filmId, it.filmId),
            isNull(curatedListItems.reasoningEn),
          ),
        )
        .returning({ id: curatedListItems.id });
      itemsN += res.length;
    }

    return { filmsN, directorsN, listsN, itemsN };
  });

  console.log(
    `\nApplied — films:${applied.filmsN} directors:${applied.directorsN} lists:${applied.listsN} listItems:${applied.itemsN}.`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
