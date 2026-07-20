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
 * Films also resync their TAGS, because `seed-content.ts` writes junctions
 * only for films it creates — so a tagSlugs change to a film that already
 * exists on the target reaches production through here and nowhere else.
 * Tags are ADD-ONLY: a tag in the database but not in seed-data is reported
 * and left alone. That asymmetry with the prose fields is deliberate. Prose
 * is single-valued, so overwriting is the only coherent option; tags are a
 * set that ADR 0014 places under admin ownership, and fixing a typo in an
 * editorialNote must not silently discard an editor's curation as a side
 * effect. Removing a tag stays an /admin act. A seed tag missing from the
 * vocabulary aborts the run before anything is written.
 *
 * NOTE: after `--apply`, the ISR'd film/director pages stay stale until the
 * next deploy. This CLI runs outside the Next server, so it can't call
 * revalidate.ts (server-only) — redeploy to publish the corrected pages.
 *
 *   bun run src/db/resync-content.ts --films=a,b --directors=x,y [--apply]
 *   # prod: DATABASE_URL="$DATABASE_URL_UNPOOLED" bun run src/db/resync-content.ts ... --apply
 */
import { eq, inArray } from "drizzle-orm";
import { db } from "./index";
import { films, filmTags, people, tags } from "./schema";
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

      // Tags. `seed-content.ts` writes junctions only for films it creates,
      // so a tagSlugs change to a film that already exists on the target
      // reaches it through here and nowhere else.
      const held = await tx
        .select({ slug: tags.slug })
        .from(filmTags)
        .innerJoin(tags, eq(tags.id, filmTags.tagId))
        .where(eq(filmTags.filmId, cur.id));
      const heldSlugs = new Set(held.map((r) => r.slug));
      const wantSlugs = f.tagSlugs ?? [];
      const missing = wantSlugs.filter((s) => !heldSlugs.has(s));
      const extra = [...heldSlugs].filter((s) => !wantSlugs.includes(s));

      let tagRows: { id: string; slug: string }[] = [];
      if (missing.length) {
        tagRows = await tx
          .select({ id: tags.id, slug: tags.slug })
          .from(tags)
          .where(inArray(tags.slug, missing));
        const unknown = missing.filter((s) => !tagRows.some((r) => r.slug === s));
        if (unknown.length) {
          // Abort rather than silently drop the junction — the same shape
          // seed-content.ts uses. Throwing rolls the transaction back, so
          // nothing from any earlier slug in this run is written either.
          throw new Error(
            `film ${slug}: tag(s) not in this database's vocabulary: ${unknown.join(", ")}\n` +
              "  The vocabulary is admin-owned (ADR 0014), so this script will not create them.\n" +
              "  Create them in /admin/tags, or:\n" +
              `    bun run apply:tags -- --create-tags=${unknown.join(",")} --apply\n` +
              "  then re-run. Nothing has been written.",
          );
        }
      }

      const diff = proseDiff || missing.length > 0;
      console.log(`  film ${slug}: ${diff ? "differs → resync" : "already in sync"}`);
      for (const s of missing) console.log(`      + tag ${s}`);
      // Add-only, deliberately. Prose is single-valued so overwriting is the
      // only coherent option, but tags are a set under admin ownership — a
      // typo fix to an editorialNote must not silently discard an editor's
      // curation as a side effect. Removing a tag stays an /admin act.
      for (const s of extra) console.log(`      = DB also has "${s}" (not in seed) — left alone`);

      if (diff) {
        changed++;
        if (APPLY) {
          if (proseDiff) await tx.update(films).set(next).where(eq(films.slug, slug));
          if (tagRows.length) {
            await tx
              .insert(filmTags)
              .values(tagRows.map((t) => ({ filmId: cur.id, tagId: t.id })))
              .onConflictDoNothing();
          }
        }
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
