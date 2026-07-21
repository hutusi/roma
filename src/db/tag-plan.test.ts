import { describe, expect, test } from "bun:test";
import {
  decideTag,
  type FilmTag,
  filmTagKey,
  planFilmTags,
  planVocabulary,
  seededFilmTags,
} from "./tag-plan";

/**
 * The scripts these rules drive touch a database and cannot be unit
 * tested; four review rounds found four bugs in that blind spot. Each is a
 * named case below, so a regression fails here rather than on production.
 * Keep the "why" comments — they are the reason a future edit should not
 * "simplify" any of this away.
 */

const set = (...keys: string[]) => new Set(keys);
const pairs = (...ps: FilmTag[]) => new Set(ps.map(filmTagKey));

describe("decideTag — the three-way merge", () => {
  test("in seed, never seeded before → this release adds it", () => {
    expect(decideTag(true, false, false)).toBe("apply");
  });

  test("in seed, seeded before, still in DB → nothing to do", () => {
    expect(decideTag(true, true, true)).toBe("present");
  });

  // The row every earlier design got wrong. With only seed-data and the
  // database this is indistinguishable from "apply" — the baseline is the
  // entire difference.
  test("in seed, seeded before, gone from DB → an editor removed it", () => {
    expect(decideTag(true, true, false)).toBe("removed-by-editor");
  });

  test("no longer in seed → the release dropped it, leave the row alone", () => {
    expect(decideTag(false, true, true)).toBe("dropped-from-seed");
  });
});

describe("planVocabulary", () => {
  test("creates tags this release introduces", () => {
    expect(planVocabulary(["war", "wuxia"], set(), set()).create).toEqual(["war", "wuxia"]);
  });

  test("does not recreate a tag an editor retired", () => {
    // Round 1: apply-tags recreated every seed tag missing from the DB.
    const { create, retired } = planVocabulary(["war", "wuxia"], set("war", "wuxia"), set("war"));
    expect(create).toEqual([]);
    expect(retired).toEqual(["wuxia"]);
  });

  test("an emptied vocabulary is not restored", () => {
    // Round 4: tag-table emptiness read as "fresh database", so a deploy
    // recreated all 19 seeded tags and relinked the whole catalogue.
    const seeded = ["war", "wuxia", "epic"];
    const { create, retired } = planVocabulary(seeded, set(...seeded), set());
    expect(create).toEqual([]);
    expect(retired).toEqual(seeded);
  });
});

describe("planFilmTags", () => {
  const films = [{ slug: "ran", tagSlugs: ["epic", "war"] }];

  test("a newly created film gets all of its tags", () => {
    // No baseline, no junctions — every tag is an addition. This is why
    // new and existing films stop being separate code paths.
    expect(planFilmTags(films, pairs(), pairs()).apply).toEqual([
      { filmSlug: "ran", tagSlug: "epic" },
      { filmSlug: "ran", tagSlug: "war" },
    ]);
  });

  test("a tag this release adds to an existing film is applied", () => {
    // Round 2: ten already-existing films were retagged in seed-data and
    // the seeder skipped them, so the change never reached production.
    const seededBefore = pairs({ filmSlug: "ran", tagSlug: "epic" });
    const { apply } = planFilmTags(films, seededBefore, seededBefore);
    expect(apply).toEqual([{ filmSlug: "ran", tagSlug: "war" }]);
  });

  test("clearing a film's tags in /admin survives a seed run", () => {
    // saveFilm deletes every junction and re-inserts only a non-empty
    // selection, so "zero junctions" is a state an editor can choose.
    // Under the old two-input comparison that was indistinguishable from
    // a film nobody had ever touched.
    const baseline = pairs(
      { filmSlug: "ran", tagSlug: "epic" },
      { filmSlug: "ran", tagSlug: "war" },
    );
    const { apply, removedByEditor } = planFilmTags(films, baseline, pairs());
    expect(apply).toEqual([]);
    expect(removedByEditor).toHaveLength(2);
  });

  test("an editor's own extra tag is never touched or reported", () => {
    const baseline = pairs(
      { filmSlug: "ran", tagSlug: "epic" },
      { filmSlug: "ran", tagSlug: "war" },
    );
    const inDb = pairs(
      { filmSlug: "ran", tagSlug: "epic" },
      { filmSlug: "ran", tagSlug: "war" },
      { filmSlug: "ran", tagSlug: "suspense" },
    );
    const { apply, removedByEditor } = planFilmTags(films, baseline, inDb);
    expect(apply).toEqual([]);
    expect(removedByEditor).toEqual([]);
  });

  test("films with no seeded tags produce nothing", () => {
    expect(planFilmTags([{ slug: "ran" }], pairs(), pairs()).apply).toEqual([]);
  });
});

describe("seededFilmTags", () => {
  test("flattens what seed-data asserts, for the next run's baseline", () => {
    expect(seededFilmTags([{ slug: "ran", tagSlugs: ["epic"] }, { slug: "m" }])).toEqual([
      { filmSlug: "ran", tagSlug: "epic" },
    ]);
  });
});

describe("idempotency", () => {
  test("apply, record the baseline, re-run → nothing written", () => {
    const films = [{ slug: "ran", tagSlugs: ["epic", "war"] }];

    const first = planFilmTags(films, pairs(), pairs());
    expect(first.apply).toHaveLength(2);

    // The run records what seed-data asked for, and the rows now exist.
    const baseline = pairs(...seededFilmTags(films));
    const inDb = pairs(...first.apply);

    const second = planFilmTags(films, baseline, inDb);
    expect(second.apply).toEqual([]);
    expect(second.removedByEditor).toEqual([]);
  });
});
