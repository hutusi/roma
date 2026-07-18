/**
 * One-off, idempotent linker: points existing film_cast rows at curated
 * people. The content seeder only inserts cast for NEWLY-created films, so
 * on a database seeded before actors were curated (exactly production's
 * state) the credits exist but carry no personId. This script reads the
 * same seed-data corpus and UPDATEs rows by (film slug, cast name).
 *
 * Safety and idempotency:
 *   - Default is a DRY RUN: prints the target DB host and every link it
 *     would write, writes nothing. Pass `--apply` to write.
 *   - Only rows whose person_id IS NULL are touched — a re-run is a no-op
 *     and a link later changed through the admin is never clobbered.
 *   - Aborts (before any write) if a personSlug has no people row: seed
 *     the people first (`bun run db:seed:content`).
 *
 * Freshness: like backfill-en/resync-content this runs outside the Next
 * server and cannot revalidate — redeploy after `--apply`.
 *
 * Run (local):  bun --conditions=react-server run src/db/link-cast.ts [--apply]
 * Run (prod):   bun --env-file=.env.production.local --conditions=react-server \
 *                 run src/db/link-cast.ts            # dry run first
 *               bun --env-file=.env.production.local --conditions=react-server \
 *                 run src/db/link-cast.ts --apply    # then write
 */
import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "./index";
import { filmCast, films, people } from "./schema";
import { seedFilms } from "./seed-data/films";

const APPLY = process.argv.includes("--apply");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }
  console.log(`Target DB host: ${new URL(url).hostname}`);
  console.log(`MODE: ${APPLY ? "APPLY (writing)" : "dry run (no writes; pass --apply)"}\n`);

  const targets = seedFilms.flatMap((f) =>
    (f.cast ?? []).flatMap((m) =>
      m.personSlug ? [{ filmSlug: f.slug, name: m.name, personSlug: m.personSlug }] : [],
    ),
  );
  if (!targets.length) {
    console.log("No personSlug links in seed data — nothing to do.");
    process.exit(0);
  }

  let linked = 0;
  let already = 0;
  let missing = 0;

  await db.transaction(async (tx) => {
    const personSlugs = [...new Set(targets.map((t) => t.personSlug))];
    const personRows = await tx
      .select({ id: people.id, slug: people.slug })
      .from(people)
      .where(inArray(people.slug, personSlugs));
    const personBySlug = new Map(personRows.map((r) => [r.slug, r.id]));
    const absentPeople = personSlugs.filter((s) => !personBySlug.has(s));
    if (absentPeople.length) {
      throw new Error(
        `people rows missing for: ${absentPeople.join(", ")} — run db:seed:content first`,
      );
    }

    const filmSlugs = [...new Set(targets.map((t) => t.filmSlug))];
    const filmRows = await tx
      .select({ id: films.id, slug: films.slug })
      .from(films)
      .where(inArray(films.slug, filmSlugs));
    const filmBySlug = new Map(filmRows.map((r) => [r.slug, r.id]));

    for (const t of targets) {
      const filmId = filmBySlug.get(t.filmSlug);
      if (!filmId) {
        missing++;
        console.warn(`  ? film not in DB: ${t.filmSlug}`);
        continue;
      }
      const rows = await tx
        .select({ id: filmCast.id, personId: filmCast.personId })
        .from(filmCast)
        .where(and(eq(filmCast.filmId, filmId), eq(filmCast.name, t.name)));
      if (!rows.length) {
        missing++;
        console.warn(`  ? cast row not found: ${t.filmSlug} | ${t.name}`);
        continue;
      }
      for (const row of rows) {
        if (row.personId) {
          already++;
          continue;
        }
        linked++;
        console.log(`  link ${t.filmSlug} | ${t.name} → ${t.personSlug}`);
        if (APPLY) {
          await tx
            .update(filmCast)
            .set({ personId: personBySlug.get(t.personSlug) })
            .where(and(eq(filmCast.id, row.id), isNull(filmCast.personId)));
        }
      }
    }
  });

  console.log(
    `\n${APPLY ? "Applied" : "Would link"} — linked:${linked} already-linked:${already} missing:${missing}.`,
  );
  if (!APPLY && linked) console.log("Re-run with --apply to write, then redeploy.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
