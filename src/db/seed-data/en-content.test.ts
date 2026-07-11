import { describe, expect, test } from "bun:test";
import { EDITORIAL_NOTE_EN_MAX, EDITORIAL_NOTE_EN_MIN, wordCount } from "../../lib/validators/film";
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

describe("English director editions", () => {
  test("every director with careerEssayEn also has a non-empty bioEn", () => {
    const bad = seedDirectors.filter((d) => d.careerEssayEn && !d.bioEn?.trim()).map((d) => d.slug);
    expect(bad).toEqual([]);
  });

  test("every careerEssayEn is a tiptap doc", () => {
    const bad = seedDirectors
      .filter((d) => d.careerEssayEn && !isTiptapDoc(d.careerEssayEn))
      .map((d) => d.slug);
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
