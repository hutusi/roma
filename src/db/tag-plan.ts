/**
 * Pure decision logic for seeding tags. No database access — so the rules
 * are unit-testable, which the script wrapped around them is not.
 *
 * Everything here rests on one idea. Comparing seed-data against the
 * database gives two inputs, and two inputs cannot express intent: a tag
 * present in seed-data but absent from the database is *either* something
 * this release adds *or* something an editor removed, and nothing
 * distinguishes them. Recording what seed-data asserted at the last run
 * supplies the missing third input and makes it a three-way merge:
 *
 *   seed-data   baseline   database   →  meaning               action
 *   ──────────────────────────────────────────────────────────────────
 *   yes         no         —          →  this release adds it   APPLY
 *   yes         yes        no         →  an editor removed it   leave
 *   yes         yes        yes        →  already applied        nothing
 *   no          yes        yes        →  release dropped it     leave
 *
 * The second row is the one every earlier design got wrong, in four
 * different places. The fourth is add-only: seed-data dropping a tag is
 * never a reason to delete an editor's row — removing a tag stays an
 * /admin act (ADR 0014).
 */

/** The only film shape these rules need — deliberately not `SeedFilm`. */
export type TaggedFilm = { slug: string; tagSlugs?: string[] };

export type Decision =
  /** In seed-data, never seeded before → this release introduces it. */
  | "apply"
  /** Seeded before and still in the database → nothing to do. */
  | "present"
  /** Seeded before, gone from the database → an editor removed it. */
  | "removed-by-editor"
  /** No longer in seed-data → the release dropped it; leave the row be. */
  | "dropped-from-seed";

export function decideTag(inSeed: boolean, inBaseline: boolean, inDb: boolean): Decision {
  if (!inSeed) return "dropped-from-seed";
  if (inDb) return "present";
  return inBaseline ? "removed-by-editor" : "apply";
}

/** A (film, tag) pair, compared by slug so it survives rows being recreated. */
export type FilmTag = { filmSlug: string; tagSlug: string };

/** Membership key for a pair, so callers build their lookup sets the same way. */
export const filmTagKey = (p: FilmTag) => `${p.filmSlug} ${p.tagSlug}`;

/**
 * Which vocabulary entries this run should create.
 *
 * `retired` are slugs seed-data still lists that an editor has deleted.
 * They are reported and never recreated — that is the whole point of the
 * baseline, and it is what stops a deploy from restoring a vocabulary
 * somebody deliberately dismantled.
 */
export function planVocabulary(
  seedSlugs: readonly string[],
  baseline: ReadonlySet<string>,
  inDb: ReadonlySet<string>,
): { create: string[]; retired: string[] } {
  const create: string[] = [];
  const retired: string[] = [];
  for (const slug of seedSlugs) {
    const decision = decideTag(true, baseline.has(slug), inDb.has(slug));
    if (decision === "apply") create.push(slug);
    else if (decision === "removed-by-editor") retired.push(slug);
  }
  return { create, retired };
}

/**
 * Which junctions this run should write.
 *
 * New films and existing films are not different cases here: a film
 * created moments ago has no baseline and no junctions, so every tag it
 * carries is an addition. That is why this replaces both the
 * newFilmSlugs-scoped path and the separate resync for existing films.
 */
export function planFilmTags(
  films: readonly TaggedFilm[],
  baseline: ReadonlySet<string>,
  inDb: ReadonlySet<string>,
): { apply: FilmTag[]; removedByEditor: FilmTag[] } {
  const apply: FilmTag[] = [];
  const removedByEditor: FilmTag[] = [];
  for (const f of films) {
    for (const tagSlug of f.tagSlugs ?? []) {
      const pair = { filmSlug: f.slug, tagSlug };
      const k = filmTagKey(pair);
      const decision = decideTag(true, baseline.has(k), inDb.has(k));
      if (decision === "apply") apply.push(pair);
      else if (decision === "removed-by-editor") removedByEditor.push(pair);
    }
  }
  return { apply, removedByEditor };
}

/**
 * Every (film, tag) seed-data currently asserts — the **complete** baseline
 * for the next run.
 *
 * Callers must REPLACE the stored baseline with this, never merge into it.
 * Merging leaves rows from releases that have since dropped an assignment,
 * and a stale row is indistinguishable from a genuine one: it makes a later
 * re-addition look like an editor's removal, and the change is refused.
 */
export function seededFilmTags(films: readonly TaggedFilm[]): FilmTag[] {
  return films.flatMap((f) => (f.tagSlugs ?? []).map((tagSlug) => ({ filmSlug: f.slug, tagSlug })));
}
