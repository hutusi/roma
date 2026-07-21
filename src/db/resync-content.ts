/**
 * Overwrite the editorial content fields of specific rows from `seed-data`,
 * by slug. `backfill-en.ts` only *fills* NULL/draft rows, so a correction to
 * an already-published row (e.g. fixing a factual error) needs this instead.
 *
 * Dry-run by default — prints the target host and, per slug, whether the DB
 * content currently differs from seed-data. `--apply` writes, in one
 * transaction. It touches ONLY the named slugs and only their content fields
 * (status/publishedAt are left untouched).
 *
 * Prose only — it does not touch tag junctions. `seed-content.ts` owns
 * those, deciding what to write from a recorded baseline rather than from
 * a flag anyone has to remember (ADR 0014). An earlier version synced tags
 * here too, which meant the command someone ran to add a missing tag also
 * reverted any note an editor had rewritten in /admin, silently, while the
 * output mentioned only the tag.
 *
 * NOTE: after `--apply`, the ISR'd film/director pages stay stale until the
 * next deploy. This CLI runs outside the Next server, so it can't call
 * revalidate.ts (server-only) — redeploy to publish the corrected pages.
 *
 *   bun run src/db/resync-content.ts --films=a,b --directors=x,y [--apply]
 *   # prod: DATABASE_URL="$DATABASE_URL_UNPOOLED" bun run src/db/resync-content.ts ... --apply
 */
import { eq } from "drizzle-orm";
import { db } from "./index";
import { films, people } from "./schema";
import { seedDirectors } from "./seed-data/directors";
import { seedFilms } from "./seed-data/films";

const APPLY = process.argv.includes("--apply");
const listArg = (name: string): string[] => {
  const p = process.argv.find((a) => a.startsWith(`--${name}=`));
  return p
    ? p
        .slice(name.length + 3)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
};
const filmSlugs = listArg("films");
const directorSlugs = listArg("directors");

// Postgres stores jsonb with re-ordered keys, so compare a canonical
// (recursively key-sorted) form to avoid false "differs" on tiptap docs.
const canon = (v: unknown): unknown => {
  if (Array.isArray(v)) return v.map(canon);
  if (v && typeof v === "object") {
    return Object.fromEntries(
      Object.keys(v as Record<string, unknown>)
        .sort()
        .map((k) => [k, canon((v as Record<string, unknown>)[k])]),
    );
  }
  return v;
};
const same = (a: unknown, b: unknown) =>
  JSON.stringify(canon(a ?? null)) === JSON.stringify(canon(b ?? null));

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
  if (!filmSlugs.length && !directorSlugs.length) {
    console.error("Nothing to do. Pass --films=… and/or --directors=…");
    process.exit(1);
  }
  console.log(`\nContent resync → DB host: ${targetHost()}`);
  console.log("SCOPE: editorial prose only (tag junctions are seed-content's)");
  console.log(APPLY ? "MODE: APPLY (writing)\n" : "MODE: dry run (no writes; pass --apply)\n");

  let changed = 0;

  await db.transaction(async (tx) => {
    for (const slug of filmSlugs) {
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
        editorialNote: f.editorialNote,
        editorialNoteEn: f.editorialNoteEn ?? null,
        essay: f.essay ?? null,
        essayEn: f.essayEn ?? null,
      };
      const proseDiff =
        !same(cur.editorialNote, next.editorialNote) ||
        !same(cur.editorialNoteEn, next.editorialNoteEn) ||
        !same(cur.essay, next.essay) ||
        !same(cur.essayEn, next.essayEn);
      console.log(`  film ${slug}: ${proseDiff ? "differs → resync" : "already in sync"}`);
      if (proseDiff) {
        changed++;
        if (APPLY) await tx.update(films).set(next).where(eq(films.slug, slug));
      }
    }

    for (const slug of directorSlugs) {
      const d = seedDirectors.find((x) => x.slug === slug);
      if (!d) {
        console.log(`  director ${slug}: ⚠ not in seed-data — skipped`);
        continue;
      }
      const cur = await tx.query.people.findFirst({ where: eq(people.slug, slug) });
      if (!cur) {
        console.log(`  director ${slug}: ⚠ not in DB — skipped`);
        continue;
      }
      const next = {
        bio: d.bio,
        bioEn: d.bioEn ?? null,
        careerEssay: d.careerEssay ?? null,
        careerEssayEn: d.careerEssayEn ?? null,
      };
      const diff =
        !same(cur.bio, next.bio) ||
        !same(cur.bioEn, next.bioEn) ||
        !same(cur.careerEssay, next.careerEssay) ||
        !same(cur.careerEssayEn, next.careerEssayEn);
      console.log(`  director ${slug}: ${diff ? "differs → resync" : "already in sync"}`);
      if (diff) {
        changed++;
        if (APPLY) await tx.update(people).set(next).where(eq(people.slug, slug));
      }
    }
  });

  console.log(`\n${APPLY ? "Applied" : "Would resync"} — ${changed} row(s) with content drift.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
