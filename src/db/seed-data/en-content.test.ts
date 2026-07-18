import { describe, expect, test } from "bun:test";
import { EDITORIAL_NOTE_EN_MAX, EDITORIAL_NOTE_EN_MIN, wordCount } from "../../lib/validators/film";
import { seedActors } from "./actors";
import { seedDirectors } from "./directors";
import { seedFilms } from "./films";
import { seedLists } from "./lists";

/**
 * Guards the authored English corpus so an out-of-gate note can never reach the
 * backfill. The publish gate that actually blocks en-publish is the film note's
 * 120–350-word window (src/lib/validators/film.ts); the rest are presence
 * checks mirroring seed-content's statusEn logic.
 */

const isTiptapDoc = (v: unknown) =>
  typeof v === "object" && v !== null && (v as { type?: unknown }).type === "doc";

describe("English film editions", () => {
  const withNote = seedFilms.filter((f) => f.editorialNoteEn);

  test("every editorialNoteEn is within the 120–350-word publish gate", () => {
    const offenders = withNote
      .map((f) => ({ slug: f.slug, words: wordCount(f.editorialNoteEn as string) }))
      .filter((r) => r.words < EDITORIAL_NOTE_EN_MIN || r.words > EDITORIAL_NOTE_EN_MAX);
    expect(offenders).toEqual([]);
  });

  test("every film with an English note also has titleEn", () => {
    const missing = withNote.filter((f) => !f.titleEn?.trim()).map((f) => f.slug);
    expect(missing).toEqual([]);
  });

  test("every essayEn is a tiptap doc", () => {
    const bad = seedFilms.filter((f) => f.essayEn && !isTiptapDoc(f.essayEn)).map((f) => f.slug);
    expect(bad).toEqual([]);
  });
});

describe("English person editions", () => {
  const seedPeople = [...seedDirectors, ...seedActors];

  test("every person with careerEssayEn also has a non-empty bioEn", () => {
    const bad = seedPeople.filter((d) => d.careerEssayEn && !d.bioEn?.trim()).map((d) => d.slug);
    expect(bad).toEqual([]);
  });

  test("every careerEssayEn is a tiptap doc", () => {
    const bad = seedPeople
      .filter((d) => d.careerEssayEn && !isTiptapDoc(d.careerEssayEn))
      .map((d) => d.slug);
    expect(bad).toEqual([]);
  });
});

describe("Curated actors", () => {
  test("every actor is actor-primary with a nonempty bio, bioEn, and pinned TMDB id", () => {
    // bioEn required: the corpus is fully bilingual, and seed-content
    // en-publishes on bioEn presence. tmdbPersonId required: the portrait
    // search fallback cannot be trusted for actors with namesakes.
    const bad = seedActors
      .filter(
        (a) => a.primaryRole !== "actor" || !a.bio?.trim() || !a.bioEn?.trim() || !a.tmdbPersonId,
      )
      .map((a) => a.slug);
    expect(bad).toEqual([]);
  });

  test("every personSlug in film cast resolves to a seeded person", () => {
    // Protects link-cast.ts: a typo here would abort the prod backfill.
    const known = new Set([...seedDirectors, ...seedActors].map((p) => p.slug));
    const bad = seedFilms
      .flatMap((f) => (f.cast ?? []).map((m) => ({ film: f.slug, personSlug: m.personSlug })))
      .filter((c) => c.personSlug && !known.has(c.personSlug))
      .map((c) => `${c.film}→${c.personSlug}`);
    expect(bad).toEqual([]);
  });
});

describe("English list editions", () => {
  test("every introEn is a tiptap doc", () => {
    const bad = seedLists.filter((l) => l.introEn && !isTiptapDoc(l.introEn)).map((l) => l.slug);
    expect(bad).toEqual([]);
  });

  test("every reasoningEn is a tiptap doc", () => {
    const bad = seedLists
      .flatMap((l) => l.items.map((it) => ({ list: l.slug, film: it.filmSlug, r: it.reasoningEn })))
      .filter((it) => it.r && !isTiptapDoc(it.r))
      .map((it) => `${it.list}/${it.film}`);
    expect(bad).toEqual([]);
  });
});
