/**
 * Pure decision logic for tag seeding and repair. No database access, no
 * imports from `./index` — so every rule here is unit-testable, which the
 * scripts that call it are not.
 *
 * This exists because four review rounds found four bugs of one class in
 * this logic: **inferring editorial intent from mutable database state**.
 * Each function below encodes a rule that was got wrong once, and
 * `tag-plan.test.ts` asserts it, so a future edit breaks a test rather than
 * a production database. The rules, and where they came from:
 *
 *   - A database holding films has been seeded before, whatever its tag
 *     table looks like. Tag-table emptiness was the old signal, and
 *     `deleteTag` lets an admin flip it — so retiring the vocabulary read
 *     as "fresh database" and restored the whole thing on the next deploy.
 *   - A tag diff can express additions only. Removing a tag is an /admin
 *     act; no script infers one.
 *   - A tag absent from the vocabulary never reaches a junction. It may be
 *     new, or deliberately retired, and nothing here can tell the
 *     difference — so the caller aborts and asks.
 *   - "This film has zero tags" says nothing about intent. `saveFilm`
 *     leaves exactly that state when an editor clears a film. Safety comes
 *     from callers acting only on films they were explicitly given.
 */

/** The only shape these rules need — deliberately not `SeedFilm`. */
export type TaggedFilm = { slug: string; tagSlugs?: string[] };

/**
 * Has this database been seeded before?
 *
 * Note what this function cannot see: the tag table. That is the point.
 * The seeder creates films and tags together, so film presence is a
 * durable record of "seeded before", whereas an empty tag table is a
 * state an editor can reach deliberately through /admin.
 */
export const isFirstRun = (filmCount: number): boolean => filmCount === 0;

/**
 * Tag slugs the given films need that the vocabulary does not hold.
 * Non-empty means the caller must stop and ask rather than create them:
 * an absent slug is equally likely to be new or deliberately retired.
 */
export function missingVocabulary(films: TaggedFilm[], known: ReadonlySet<string>): string[] {
  const needed = new Set<string>();
  for (const f of films) for (const s of f.tagSlugs ?? []) if (!known.has(s)) needed.add(s);
  return [...needed];
}

/**
 * Compare a film's seeded tags against what the database holds.
 *
 * `extra` is reported so a human can see it; it is deliberately NOT a
 * removal list. There is no shape in this return type that a caller could
 * turn into a DELETE, which is the add-only rule made structural instead
 * of conventional.
 */
export function diffFilmTags(
  want: readonly string[],
  held: ReadonlySet<string>,
): { missing: string[]; extra: string[] } {
  const wanted = new Set(want);
  return {
    missing: want.filter((s) => !held.has(s)),
    extra: [...held].filter((s) => !wanted.has(s)),
  };
}

/**
 * Films whose seeded tags the database does not fully hold — the drift
 * report set.
 *
 * This is database drift, NOT release scope: it cannot distinguish a tag
 * the current release adds from one an editor removed on purpose. Callers
 * must present it as information and never as a list to act on.
 */
export function filmsBehindSeedTags(
  films: TaggedFilm[],
  heldBySlug: ReadonlyMap<string, ReadonlySet<string>>,
): string[] {
  return films
    .filter((f) => {
      const held = heldBySlug.get(f.slug) ?? new Set<string>();
      return (f.tagSlugs ?? []).some((s) => !held.has(s));
    })
    .map((f) => f.slug);
}

/**
 * The junction rows to insert for the given films.
 *
 * A tag slug that does not resolve is never silently dropped: it comes
 * back in `unresolved` so the caller can fail loudly. A film slug that
 * does not resolve is simply not in this database and is skipped.
 */
export function planJunctions(
  films: TaggedFilm[],
  filmIdBySlug: ReadonlyMap<string, string>,
  tagIdBySlug: ReadonlyMap<string, string>,
): { pairs: { filmId: string; tagId: string }[]; unresolved: string[] } {
  const pairs: { filmId: string; tagId: string }[] = [];
  const unresolved = new Set<string>();
  for (const f of films) {
    const filmId = filmIdBySlug.get(f.slug);
    if (!filmId) continue;
    for (const slug of f.tagSlugs ?? []) {
      const tagId = tagIdBySlug.get(slug);
      if (!tagId) {
        unresolved.add(slug);
        continue;
      }
      pairs.push({ filmId, tagId });
    }
  }
  return { pairs, unresolved: [...unresolved] };
}
