import { describe, expect, test } from "bun:test";
import {
  codePointLength,
  filmFormSchema,
  parseCountries,
  publishEnProblems,
  publishProblems,
  watchLinkSchema,
  wordCount,
} from "./film";

describe("codePointLength", () => {
  test("counts CJK as one per character, not UTF-16 units", () => {
    expect(codePointLength("八部半")).toBe(3);
    expect(codePointLength("")).toBe(0);
  });

  test("counts astral-plane characters once", () => {
    // 𠀀 (U+20000) is two UTF-16 code units but one code point.
    const astral = "\u{20000}";
    expect(astral.length).toBe(2);
    expect(codePointLength(astral)).toBe(1);
  });
});

describe("publishProblems", () => {
  const note = (n: number) => "字".repeat(n);
  const base = { directorCount: 1 };

  test("rejects 199, accepts 200 and 500, rejects 501 code points", () => {
    expect(publishProblems({ editorialNote: note(199), ...base })).not.toEqual([]);
    expect(publishProblems({ editorialNote: note(200), ...base })).toEqual([]);
    expect(publishProblems({ editorialNote: note(500), ...base })).toEqual([]);
    expect(publishProblems({ editorialNote: note(501), ...base })).not.toEqual([]);
  });

  test("rejects a missing note and reports the current count", () => {
    const problems = publishProblems({ editorialNote: null, ...base });
    expect(problems.join()).toContain("0 字");
  });

  test("rejects a whitespace-only note — 200 spaces render as nothing", () => {
    const problems = publishProblems({ editorialNote: " ".repeat(200), ...base });
    expect(problems.join()).toContain("0 字");
  });

  test("requires at least one director", () => {
    const problems = publishProblems({ editorialNote: note(300), directorCount: 0 });
    expect(problems.join()).toContain("导演");
  });
});

describe("wordCount", () => {
  test("splits on any whitespace run and ignores surrounding space", () => {
    expect(wordCount("a quiet, black-and-white masterpiece")).toBe(4);
    expect(wordCount("  two\n words \t here ")).toBe(3);
    expect(wordCount("")).toBe(0);
    expect(wordCount("   ")).toBe(0);
  });
});

describe("publishEnProblems", () => {
  const noteEn = (n: number) => Array.from({ length: n }, () => "word").join(" ");

  test("rejects 119, accepts 120 and 350, rejects 351 words", () => {
    const base = { titleEn: "8½" };
    expect(publishEnProblems({ ...base, editorialNoteEn: noteEn(119) })).not.toEqual([]);
    expect(publishEnProblems({ ...base, editorialNoteEn: noteEn(120) })).toEqual([]);
    expect(publishEnProblems({ ...base, editorialNoteEn: noteEn(350) })).toEqual([]);
    expect(publishEnProblems({ ...base, editorialNoteEn: noteEn(351) })).not.toEqual([]);
  });

  test("requires an English title and reports the current word count", () => {
    const problems = publishEnProblems({ titleEn: "  ", editorialNoteEn: null });
    expect(problems.join()).toContain("titleEn");
    expect(problems.join()).toContain("0 词");
  });
});

describe("parseCountries", () => {
  test("splits on 、 ， and , and trims", () => {
    expect(parseCountries("意大利、法国")).toEqual(["意大利", "法国"]);
    expect(parseCountries("意大利, 法国 ，西德")).toEqual(["意大利", "法国", "西德"]);
  });

  test("empty and undefined input yield []", () => {
    expect(parseCountries("")).toEqual([]);
    expect(parseCountries(undefined)).toEqual([]);
    expect(parseCountries(" 、 ")).toEqual([]);
  });
});

describe("filmFormSchema", () => {
  const valid = {
    slug: "otto-e-mezzo",
    titleZh: "八部半",
    titleOriginal: "Otto e mezzo",
    year: "1963",
    isBlackAndWhite: true,
    cast: [],
    watchLinks: [],
    directorIds: [],
    tagIds: [],
  };

  test("accepts a minimal valid film and coerces year", () => {
    const parsed = filmFormSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.year).toBe(1963);
  });

  test("rejects duplicate tag links", () => {
    expect(filmFormSchema.safeParse({ ...valid, tagIds: ["t1", "t1"] }).success).toBe(false);
    expect(filmFormSchema.safeParse({ ...valid, tagIds: ["t1", "t2"] }).success).toBe(true);
  });

  test("rejects slugs with uppercase or CJK", () => {
    expect(filmFormSchema.safeParse({ ...valid, slug: "Otto" }).success).toBe(false);
    expect(filmFormSchema.safeParse({ ...valid, slug: "八部半" }).success).toBe(false);
  });

  test("rejects a year before cinema existed", () => {
    expect(filmFormSchema.safeParse({ ...valid, year: "1800" }).success).toBe(false);
  });

  test("caps the editorial note at 500 code points but allows drafts below 200", () => {
    expect(filmFormSchema.safeParse({ ...valid, editorialNote: "短".repeat(50) }).success).toBe(
      true,
    );
    expect(filmFormSchema.safeParse({ ...valid, editorialNote: "长".repeat(501) }).success).toBe(
      false,
    );
  });
});

describe("watchLinkSchema", () => {
  test("allows empty url but rejects malformed ones", () => {
    expect(watchLinkSchema.safeParse({ platform: "CC", region: "INTL", url: "" }).success).toBe(
      true,
    );
    expect(
      watchLinkSchema.safeParse({ platform: "CC", region: "INTL", url: "not-a-url" }).success,
    ).toBe(false);
  });

  test("rejects unknown regions", () => {
    expect(watchLinkSchema.safeParse({ platform: "CC", region: "JP" }).success).toBe(false);
  });
});
