import { describe, expect, test } from "bun:test";
import {
  diffFilmTags,
  filmsBehindSeedTags,
  isFirstRun,
  missingVocabulary,
  planJunctions,
} from "./tag-plan";

/**
 * Each block below is a rule that was got wrong once and found in review.
 * The scripts these rules live in touch a database and cannot be unit
 * tested; extracting the decisions means a regression fails here instead
 * of on production. Keep the "why" comments — they are the reason a future
 * edit should not "simplify" these away.
 */

describe("isFirstRun", () => {
  test("a database holding films has been seeded before", () => {
    expect(isFirstRun(74)).toBe(false);
    expect(isFirstRun(1)).toBe(false);
  });

  test("only an empty catalogue is a first run", () => {
    expect(isFirstRun(0)).toBe(true);
  });

  // The bug: tag-table emptiness was the old signal. deleteTag lets an
  // admin empty that table, so retiring the vocabulary made the seeder
  // think the database was fresh and restore all of it. This function
  // cannot see tags at all — the signature is the fix.
  test("cannot be influenced by tag state — it takes only a film count", () => {
    expect(isFirstRun.length).toBe(1);
  });
});

describe("missingVocabulary", () => {
  test("names slugs the vocabulary lacks, deduplicated", () => {
    const films = [
      { slug: "a", tagSlugs: ["wuxia", "epic"] },
      { slug: "b", tagSlugs: ["wuxia", "comedy"] },
    ];
    expect(missingVocabulary(films, new Set(["comedy"])).sort()).toEqual(["epic", "wuxia"]);
  });

  test("is empty when the vocabulary covers everything", () => {
    const films = [{ slug: "a", tagSlugs: ["comedy"] }];
    expect(missingVocabulary(films, new Set(["comedy", "epic"]))).toEqual([]);
  });

  test("films without tags need nothing", () => {
    expect(missingVocabulary([{ slug: "a" }], new Set())).toEqual([]);
  });
});

describe("diffFilmTags", () => {
  test("missing is what seed has and the database does not", () => {
    const { missing } = diffFilmTags(["war", "epic"], new Set(["war"]));
    expect(missing).toEqual(["epic"]);
  });

  test("extra is reported, so a human can see an editor's addition", () => {
    const { extra } = diffFilmTags(["war"], new Set(["war", "suspense"]));
    expect(extra).toEqual(["suspense"]);
  });

  // The rule: resync is add-only. An editor's extra tag is information,
  // never a deletion. The return type has no field a caller could turn
  // into a DELETE, which makes add-only structural rather than a habit.
  test("returns nothing a caller could delete", () => {
    const result = diffFilmTags(["war"], new Set(["war", "suspense"]));
    expect(Object.keys(result).sort()).toEqual(["extra", "missing"]);
  });

  test("a film cleared in /admin still reports its seeded tags as missing", () => {
    // Zero held tags is a state saveFilm leaves behind when an editor
    // clears a film. The diff cannot tell that from "never curated" — so
    // safety lives in callers only ever acting on films they were given
    // explicitly, never in this function refusing to answer.
    expect(diffFilmTags(["war"], new Set()).missing).toEqual(["war"]);
  });
});

describe("filmsBehindSeedTags", () => {
  const held = new Map<string, ReadonlySet<string>>([
    ["a", new Set(["war"])],
    ["b", new Set(["war", "epic"])],
  ]);

  test("lists films whose seeded tags are not all held", () => {
    const films = [
      { slug: "a", tagSlugs: ["war", "epic"] },
      { slug: "b", tagSlugs: ["war", "epic"] },
    ];
    expect(filmsBehindSeedTags(films, held)).toEqual(["a"]);
  });

  test("a film absent from the map counts as holding nothing", () => {
    expect(filmsBehindSeedTags([{ slug: "z", tagSlugs: ["war"] }], held)).toEqual(["z"]);
  });

  test("films with no seeded tags never drift", () => {
    expect(filmsBehindSeedTags([{ slug: "a" }], held)).toEqual([]);
  });
});

describe("planJunctions", () => {
  const filmIds = new Map([["a", "film-a"]]);
  const tagIds = new Map([["war", "tag-war"]]);

  test("pairs resolved films with resolved tags", () => {
    const { pairs } = planJunctions([{ slug: "a", tagSlugs: ["war"] }], filmIds, tagIds);
    expect(pairs).toEqual([{ filmId: "film-a", tagId: "tag-war" }]);
  });

  // The rule: a tag outside the vocabulary may be new, or deliberately
  // retired. Either way it must not become a junction, and it must not
  // vanish quietly — the caller needs it to fail loudly.
  test("a tag outside the vocabulary never becomes a junction, and is reported", () => {
    const { pairs, unresolved } = planJunctions(
      [{ slug: "a", tagSlugs: ["war", "retired"] }],
      filmIds,
      tagIds,
    );
    expect(pairs).toEqual([{ filmId: "film-a", tagId: "tag-war" }]);
    expect(unresolved).toEqual(["retired"]);
  });

  test("a film not in this database is skipped without complaint", () => {
    const { pairs, unresolved } = planJunctions(
      [{ slug: "not-here", tagSlugs: ["war"] }],
      filmIds,
      tagIds,
    );
    expect(pairs).toEqual([]);
    expect(unresolved).toEqual([]);
  });
});
