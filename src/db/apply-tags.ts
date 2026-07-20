/**
 * Creates named vocabulary entries from `seed-data/tags.ts` on a database
 * whose `tags` table is already admin-owned.
 *
 * Why a separate script: `seed-content.ts` seeds the vocabulary on the FIRST
 * RUN ONLY (ADR 0014) — once any tag exists, the vocabulary belongs to
 * `/admin/tags` and the seeder never touches it again. But the seeder also
 * refuses to insert a film referencing a tag that does not exist, so a batch
 * introducing new tags needs them created first. This does that, and nothing
 * else.
 *
 * It creates ONLY the slugs you name. That is deliberate, and it is a
 * correction: an earlier version created every seed tag missing from the
 * database, on the theory that a missing slug must be new. It is not —
 * `deleteTag` lets an editor retire a tag once no published film carries it,
 * so an absent slug is just as likely to be one deliberately removed, and
 * nothing in the database distinguishes the two. Recreating it silently
 * reverted an editorial decision. Naming a slug IS the assertion that it
 * should exist; the script supplies no judgement of its own.
 *
 * What this script does NOT do:
 *   - It does not attach tags to films. Films the seeder creates are tagged
 *     there; a tagSlugs change to a film that already exists is a content
 *     update to an existing row, which is `resync-content.ts --films=…`.
 *   - It never renames. A tag whose DB names differ from tags.ts is reported
 *     and left alone.
 *   - It never deletes.
 *
 * Freshness: like backfill-en/link-cast/resync-content this runs outside the
 * Next server and cannot revalidate — redeploy after `--apply`.
 *
 * Run (local):  bun run apply:tags -- --create-tags=wuxia,epic
 *               bun run apply:tags -- --create-tags=wuxia,epic --apply
 * Run (prod):   bun --env-file=.env.production.local run src/db/apply-tags.ts \
 *                 -- --create-tags=… [--apply]
 */
import { inArray } from "drizzle-orm";
import { db } from "./index";
import { tags } from "./schema";
import { seedTags } from "./seed-data/tags";

const APPLY = process.argv.includes("--apply");

/** `--flag=a,b,c` → ["a","b","c"] (empty when the flag is absent). */
function listFlag(name: string): string[] {
  const prefix = `--${name}=`;
  const raw = process.argv.find((a) => a.startsWith(prefix))?.slice(prefix.length) ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const CREATE_TAGS = listFlag("create-tags");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }
  console.log(`Target DB host: ${new URL(url).hostname}`);
  console.log(`MODE: ${APPLY ? "APPLY (writing)" : "dry run (no writes; pass --apply)"}\n`);

  if (!CREATE_TAGS.length) {
    console.log(
      "Nothing named, so nothing to do. This tool creates vocabulary entries:\n" +
        "  --create-tags=slug,slug   create these tags from seed-data/tags.ts\n\n" +
        "To tag films:\n" +
        "  films the seeder creates are tagged by seed-content.ts itself;\n" +
        "  a tag change to a film that already exists is a content update —\n" +
        "  bun run src/db/resync-content.ts --films=slug,slug --apply",
    );
    process.exit(0);
  }

  const seedTagBySlug = new Map(seedTags.map((t) => [t.slug, t]));
  const unknown = CREATE_TAGS.filter((s) => !seedTagBySlug.has(s));
  if (unknown.length) {
    console.error(
      `✗ not in seed-data/tags.ts: ${unknown.join(", ")}\n` +
        "  Add them there first, so a fresh database seeds the same vocabulary.",
    );
    process.exit(1);
  }

  let created = 0;

  await db.transaction(async (tx) => {
    const present = new Set(
      (await tx.select({ slug: tags.slug }).from(tags).where(inArray(tags.slug, CREATE_TAGS))).map(
        (r) => r.slug,
      ),
    );
    for (const s of CREATE_TAGS.filter((s) => present.has(s))) {
      console.log(`  = tag ${s} already exists — left as-is`);
    }
    const toCreate = CREATE_TAGS.filter((s) => !present.has(s)).map(
      (s) => seedTagBySlug.get(s) as (typeof seedTags)[number],
    );
    for (const t of toCreate) {
      created++;
      console.log(`  + tag ${t.slug} (${t.nameZh} / ${t.nameEn})`);
    }
    if (APPLY && toCreate.length) {
      await tx.insert(tags).values(toCreate).onConflictDoNothing({ target: tags.slug });
    }
  });

  console.log(`\n${APPLY ? "Applied" : "Would write"} — tags:${created}.`);
  if (!APPLY && created) console.log("Re-run with --apply to write, then redeploy.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
