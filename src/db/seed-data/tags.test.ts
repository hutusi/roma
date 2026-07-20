import { describe, expect, test } from "bun:test";
import { seedFilms } from "./films";
import { seedTags } from "./tags";

/**
 * Lifts seed-content's runtime `assertPublishable` tag check into CI. An
 * unknown tagSlug otherwise fails nowhere until someone runs
 * db:seed:content against a fresh database — and on a database whose
 * vocabulary already exists, the tag block is skipped entirely, so the
 * mistake would surface only as films that silently carry no tags.
 */

describe("tag vocabulary", () => {
  test("every tagSlug used by a film is defined in tags.ts", () => {
    const known = new Set(seedTags.map((t) => t.slug));
    const unknown = seedFilms.flatMap((f) =>
      (f.tagSlugs ?? []).filter((s) => !known.has(s)).map((s) => `${f.slug} → ${s}`),
    );
    expect(unknown).toEqual([]);
  });

  test("tag slugs are unique", () => {
    const counts = new Map<string, number>();
    for (const t of seedTags) counts.set(t.slug, (counts.get(t.slug) ?? 0) + 1);
    const dupes = [...counts].filter(([, n]) => n > 1).map(([slug]) => slug);
    expect(dupes).toEqual([]);
  });

  test("tag slugs are url-safe", () => {
    const bad = seedTags.filter((t) => !/^[a-z0-9-]+$/.test(t.slug)).map((t) => t.slug);
    expect(bad).toEqual([]);
  });

  test("both names are present — the guard against zh prose on /en (ADR 0014)", () => {
    const bad = seedTags.filter((t) => !t.nameZh.trim() || !t.nameEn.trim()).map((t) => t.slug);
    expect(bad).toEqual([]);
  });

  test("no film repeats a tag", () => {
    const dupes = seedFilms
      .filter((f) => f.tagSlugs && new Set(f.tagSlugs).size !== f.tagSlugs.length)
      .map((f) => f.slug);
    expect(dupes).toEqual([]);
  });
});
