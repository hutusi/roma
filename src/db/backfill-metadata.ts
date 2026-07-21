/**
 * Copy the film metadata columns introduced with external ids — tmdbId,
 * imdbId, doubanId, wikidataId, isSilent, restorationNote(/En) — from
 * `seed-data` into existing DB rows, by slug. The content seeder only
 * inserts new films (`onConflictDoNothing`), so an already-seeded corpus
 * never picks these up on redeploy; this is the one-shot backfill.
 *
 * Prose and status are untouched (that's resync-content.ts's scope).
 * Overwrites the metadata columns with seed values, so after editors
 * start correcting ids in /admin, run it only with an explicit --films
 * list. Dry-run by default; `--apply` writes in one transaction and
 * refuses the implicit whole-corpus scope — a rollout must say --all.
 *
 *   bun run src/db/backfill-metadata.ts [--films=a,b | --all] [--apply]
 *   # prod: DATABASE_URL="$DATABASE_URL_UNPOOLED" bun run src/db/backfill-metadata.ts --all --apply
 *
 * NOTE: like resync, this runs outside the Next server — ISR'd film
 * pages stay stale until the next deploy.
 */
import { eq } from "drizzle-orm";
import { db } from "./index";
import { films } from "./schema";
import { seedFilms } from "./seed-data/films";

const APPLY = process.argv.includes("--apply");
const ALL = process.argv.includes("--all");
const filmsArg = process.argv.find((a) => a.startsWith("--films="));
const slugs = filmsArg
  ? filmsArg
      .slice("--films=".length)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : seedFilms.map((f) => f.slug);

// Writing the whole corpus reverts every id an editor corrected in
// /admin, so that scope must be spelled out — a stray --apply isn't it.
if (APPLY && !filmsArg && !ALL) {
  console.error(
    "Refusing to --apply over the whole seed corpus implicitly. Pass --films=… or --all.",
  );
  process.exit(1);
}

function targetHost(): string {
  try {
    return new URL(process.env.DATABASE_URL ?? "").host || "(unknown)";
  } catch {
    return "(unparseable DATABASE_URL)";
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      'DATABASE_URL is not set. For prod, run with DATABASE_URL="$DATABASE_URL_UNPOOLED".',
    );
    process.exit(1);
  }
  console.log(`\nMetadata backfill → DB host: ${targetHost()}`);
  console.log("SCOPE: external ids + isSilent + restoration notes (prose untouched)");
  console.log(APPLY ? "MODE: APPLY (writing)\n" : "MODE: dry run (no writes; pass --apply)\n");

  let changed = 0;

  await db.transaction(async (tx) => {
    for (const slug of slugs) {
      const f = seedFilms.find((x) => x.slug === slug);
      if (!f) {
        console.log(`  film ${slug}: ⚠ not in seed-data — skipped`);
        continue;
      }
      const cur = await tx.query.films.findFirst({ where: eq(films.slug, slug) });
      if (!cur) {
        console.log(`  film ${slug}: ⚠ not in DB — skipped`);
        continue;
      }
      const next = {
        tmdbId: f.tmdbId ?? null,
        imdbId: f.imdbId ?? null,
        doubanId: f.doubanId ?? null,
        wikidataId: f.wikidataId ?? null,
        isSilent: f.isSilent ?? false,
        restorationNote: f.restorationNote ?? null,
        restorationNoteEn: f.restorationNoteEn ?? null,
      };
      const diff = (Object.keys(next) as (keyof typeof next)[]).filter(
        (k) => (cur[k] ?? null) !== (next[k] ?? null),
      );
      console.log(
        `  film ${slug}: ${diff.length ? `differs (${diff.join(", ")}) → backfill` : "already in sync"}`,
      );
      if (diff.length) {
        changed++;
        if (APPLY) await tx.update(films).set(next).where(eq(films.slug, slug));
      }
    }
  });

  console.log(`\n${APPLY ? "Applied" : "Would backfill"} — ${changed} row(s) with metadata drift.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
