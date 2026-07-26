/**
 * Overwrite the editorial prose of specific rows from `seed-data`, by slug.
 * `backfill-en.ts` only *fills* NULL/draft rows, so a correction to an
 * already-published row (e.g. fixing a factual error) needs this instead.
 *
 * Dry-run by default — prints the target host and, per slug, which fields
 * differ from seed-data. `--apply` writes, in one transaction. It touches
 * ONLY the named slugs and only their prose fields (status/publishedAt are
 * left untouched).
 *
 * Prose only — it does not touch tag junctions. `seed-content.ts` owns
 * those, deciding what to write from a recorded baseline rather than from
 * a flag anyone has to remember (ADR 0014). An earlier version synced tags
 * here too, which meant the command someone ran to add a missing tag also
 * reverted any note an editor had rewritten in /admin, silently, while the
 * output mentioned only the tag.
 *
 * Two rules follow from that same incident:
 *
 *   · A slug in no seed file is an ERROR, not a warning. It used to print
 *     "⚠ not in seed-data — skipped" and exit 0, so `--directors=<actor>`
 *     reported success while doing nothing at all.
 *   · A field absent from seed-data is NOT asserted as null. seed-data
 *     never defines `careerEssay` for actors, so writing `?? null` would
 *     erase one an editor had written in /admin. Absent means "no opinion";
 *     `--clear=<slug>:<field>` is how you actually mean null.
 *
 * NOTE: after `--apply`, ISR'd pages stay stale until the next deploy. This
 * CLI runs outside the Next server, so it cannot call revalidate.ts
 * (server-only) — redeploy to publish the corrected pages. It also runs
 * WITHOUT `--conditions=react-server`, unlike db:seed:content, because it
 * never reaches `server-only`; do not import ./locks here.
 *
 *   bun run src/db/resync-content.ts --films=a,b --people=x,y --lists=z
 *   bun run src/db/resync-content.ts --all --diff
 *   bun run src/db/resync-content.ts --all --apply
 *   # prod: DATABASE_URL="$DATABASE_URL_UNPOOLED" bun run … --apply
 */
import { and, eq, inArray } from "drizzle-orm";
import { db } from "./index";
import { curatedListItems, curatedLists, films, people } from "./schema";
import { seedActors } from "./seed-data/actors";
import { seedDirectors } from "./seed-data/directors";
import { seedFilms } from "./seed-data/films";
import { seedLists } from "./seed-data/lists";

const argv = process.argv.slice(2);
const APPLY = argv.includes("--apply");
const ALL = argv.includes("--all");
const DIFF = argv.includes("--diff") || argv.includes("--diff=full");
/**
 * Clipping the preview is fine for spotting drift and actively misleading
 * for judging it. A clipped diff on marcel-carne looked like an
 * improvement; the full paragraph showed the DB sentence repeating a
 * phrase from the sentence before it. Decide with --diff=full.
 */
const DIFF_FULL = argv.includes("--diff=full");

const listArg = (name: string): string[] => {
  const p = argv.find((a) => a.startsWith(`--${name}=`));
  return p
    ? p
        .slice(name.length + 3)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
};

const seedPeople = [...seedDirectors, ...seedActors];

/** `--films=all` and `--all` both mean the whole set. */
const resolve = (name: string, every: string[]): string[] => {
  const raw = listArg(name);
  if (ALL || raw.includes("all")) return every;
  return raw;
};

const filmSlugs = resolve(
  "films",
  seedFilms.map((f) => f.slug),
);
// --directors= is kept as a deprecated alias so documented commands work.
const peopleSlugs = [
  ...resolve(
    "people",
    seedPeople.map((p) => p.slug),
  ),
  ...listArg("directors"),
];
const listSlugs = resolve(
  "lists",
  seedLists.map((l) => l.slug),
);

/** `--clear=slug:field,slug:field` — the only way to assert null. */
const cleared = new Set(listArg("clear"));

const FILM_FIELDS = [
  "introduction",
  "introductionEn",
  "editorialNote",
  "editorialNoteEn",
  "essay",
  "essayEn",
] as const;
const PERSON_FIELDS = [
  "bio",
  "bioEn",
  "careerEssay",
  "careerEssayEn",
  "editorialNote",
  "editorialNoteEn",
] as const;
const LIST_FIELDS = ["theme", "themeEn", "intro", "introEn"] as const;
const ITEM_FIELDS = ["reasoning", "reasoningEn"] as const;

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

/** Flatten a value to comparable text for the --diff preview. */
function preview(v: unknown): string {
  if (v == null) return "(empty)";
  if (typeof v === "string") return v;
  const parts: string[] = [];
  const walk = (n: unknown) => {
    if (!n || typeof n !== "object") return;
    const node = n as { text?: string; content?: unknown[] };
    if (typeof node.text === "string") parts.push(node.text);
    for (const c of node.content ?? []) walk(c);
  };
  walk(v);
  return parts.join(" ") || "(empty doc)";
}
const clip = (s: string, n = 110) => (DIFF_FULL || s.length <= n ? s : `${s.slice(0, n)}…`);
const len = (v: unknown) => (v == null ? 0 : Array.from(preview(v)).length);

type Plan = {
  next: Record<string, unknown>;
  differing: string[];
  unasserted: { field: string; dbLen: number }[];
};

/**
 * Build the update for one row. A field seed-data does not define is left
 * out of `next` entirely rather than written as null.
 */
function planRow(
  seed: Record<string, unknown>,
  cur: Record<string, unknown>,
  fields: readonly string[],
  slug: string,
): Plan {
  const next: Record<string, unknown> = {};
  const differing: string[] = [];
  const unasserted: { field: string; dbLen: number }[] = [];
  for (const f of fields) {
    const v = seed[f];
    if (v === undefined && !cleared.has(`${slug}:${f}`)) {
      if (cur[f] != null) unasserted.push({ field: f, dbLen: len(cur[f]) });
      continue;
    }
    const value = v === undefined ? null : v;
    next[f] = value;
    if (!same(cur[f], value)) differing.push(f);
  }
  return { next, differing, unasserted };
}

function report(label: string, plan: Plan, cur: Record<string, unknown>) {
  if (plan.differing.length) {
    console.log(`  ${label}: differs → resync (${plan.differing.join(", ")})`);
    if (DIFF) {
      for (const f of plan.differing) {
        console.log(`      ${f}  ${len(cur[f])} → ${len(plan.next[f])}`);
        console.log(`        - ${clip(preview(cur[f]))}`);
        console.log(`        + ${clip(preview(plan.next[f]))}`);
      }
    }
  } else {
    console.log(`  ${label}: already in sync`);
  }
  for (const u of plan.unasserted) {
    console.log(
      `      ${u.field}: seed asserts nothing; DB holds ${u.dbLen} chars — left alone` +
        ` (--clear=${label.split(" ")[1]}:${u.field} to null it)`,
    );
  }
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
  if (!filmSlugs.length && !peopleSlugs.length && !listSlugs.length) {
    console.error(
      "Nothing to do. Pass --films=… --people=… --lists=… (or `all` / --all for everything).",
    );
    process.exit(1);
  }

  // Every named slug must exist in seed-data. Warning-and-continue is how
  // the actor gap stayed invisible for so long (see the header).
  const unknown = [
    ...filmSlugs.filter((s) => !seedFilms.some((f) => f.slug === s)).map((s) => `film ${s}`),
    ...peopleSlugs.filter((s) => !seedPeople.some((p) => p.slug === s)).map((s) => `person ${s}`),
    ...listSlugs.filter((s) => !seedLists.some((l) => l.slug === s)).map((s) => `list ${s}`),
  ];
  if (unknown.length) {
    console.error(`\nNot in seed-data:\n${unknown.map((u) => `  ${u}`).join("\n")}`);
    process.exit(1);
  }

  console.log(`\nContent resync → DB host: ${targetHost()}`);
  console.log("SCOPE: editorial prose only (tag junctions are seed-content's)");
  console.log(
    `TARGETS: ${filmSlugs.length} film(s), ${peopleSlugs.length} person(s), ${listSlugs.length} list(s)`,
  );
  console.log(APPLY ? "MODE: APPLY (writing)\n" : "MODE: dry run (no writes; pass --apply)\n");

  let changed = 0;
  let missing = 0;

  await db.transaction(async (tx) => {
    for (const slug of filmSlugs) {
      const f = seedFilms.find((x) => x.slug === slug) as unknown as Record<string, unknown>;
      const cur = await tx.query.films.findFirst({ where: eq(films.slug, slug) });
      if (!cur) {
        console.log(`  film ${slug}: not in DB — skipped`);
        missing++;
        continue;
      }
      const plan = planRow(f, cur as Record<string, unknown>, FILM_FIELDS, slug);
      report(`film ${slug}`, plan, cur as Record<string, unknown>);
      if (plan.differing.length) {
        changed++;
        if (APPLY) await tx.update(films).set(plan.next).where(eq(films.slug, slug));
      }
    }

    for (const slug of peopleSlugs) {
      const p = seedPeople.find((x) => x.slug === slug) as unknown as Record<string, unknown>;
      const cur = await tx.query.people.findFirst({ where: eq(people.slug, slug) });
      if (!cur) {
        console.log(`  person ${slug}: not in DB — skipped`);
        missing++;
        continue;
      }
      const plan = planRow(p, cur as Record<string, unknown>, PERSON_FIELDS, slug);
      report(`person ${slug}`, plan, cur as Record<string, unknown>);
      if (plan.differing.length) {
        changed++;
        if (APPLY) await tx.update(people).set(plan.next).where(eq(people.slug, slug));
      }
    }

    for (const slug of listSlugs) {
      const l = seedLists.find((x) => x.slug === slug);
      if (!l) continue;
      const cur = await tx.query.curatedLists.findFirst({ where: eq(curatedLists.slug, slug) });
      if (!cur) {
        console.log(`  list ${slug}: not in DB — skipped`);
        missing++;
        continue;
      }
      const plan = planRow(
        l as unknown as Record<string, unknown>,
        cur as Record<string, unknown>,
        LIST_FIELDS,
        slug,
      );
      report(`list ${slug}`, plan, cur as Record<string, unknown>);
      if (plan.differing.length) {
        changed++;
        if (APPLY) await tx.update(curatedLists).set(plan.next).where(eq(curatedLists.slug, slug));
      }

      // Items are matched on (listId, filmId) exactly as backfill-en does.
      // Membership and position belong to seed-content: never insert here,
      // and never touch a row seed-data no longer carries.
      const filmSlugsInList = l.items.map((it) => it.filmSlug);
      const filmIds = filmSlugsInList.length
        ? await tx
            .select({ id: films.id, slug: films.slug })
            .from(films)
            .where(inArray(films.slug, filmSlugsInList))
        : [];
      const idBySlug = new Map(filmIds.map((r) => [r.slug, r.id]));
      for (const item of l.items) {
        const filmId = idBySlug.get(item.filmSlug);
        if (!filmId) {
          console.log(`    item ${slug}/${item.filmSlug}: film not in DB — skipped`);
          missing++;
          continue;
        }
        const curItem = await tx.query.curatedListItems.findFirst({
          where: and(eq(curatedListItems.listId, cur.id), eq(curatedListItems.filmId, filmId)),
        });
        if (!curItem) {
          console.log(`    item ${slug}/${item.filmSlug}: not a member in DB — skipped`);
          missing++;
          continue;
        }
        const key = `${slug}/${item.filmSlug}`;
        const itemPlan = planRow(
          item as unknown as Record<string, unknown>,
          curItem as Record<string, unknown>,
          ITEM_FIELDS,
          key,
        );
        report(`  item ${key}`, itemPlan, curItem as Record<string, unknown>);
        if (itemPlan.differing.length) {
          changed++;
          if (APPLY) {
            await tx
              .update(curatedListItems)
              .set(itemPlan.next)
              .where(eq(curatedListItems.id, curItem.id));
          }
        }
      }
    }
  });

  console.log(`\n${APPLY ? "Applied" : "Would resync"} — ${changed} row(s) with content drift.`);
  if (missing) console.log(`${missing} target(s) not present in the DB and skipped.`);
  if (!APPLY && changed) console.log("Re-run with --apply to write.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
