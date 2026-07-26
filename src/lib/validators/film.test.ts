import { describe, expect, test } from "bun:test";
import {
  codePointLength,
  EDITORIAL_NOTE_EN_MAX,
  EDITORIAL_NOTE_MAX,
  filmFormSchema,
  INTRODUCTION_MAX,
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
  const zh = (n: number) => "字".repeat(n);
  const base = { directorCount: 1 };

  test("rejects 199, accepts 200 and 500, rejects 501 code points", () => {
    expect(publishProblems({ introduction: zh(199), ...base })).not.toEqual([]);
    expect(publishProblems({ introduction: zh(200), ...base })).toEqual([]);
    expect(publishProblems({ introduction: zh(500), ...base })).toEqual([]);
    expect(publishProblems({ introduction: zh(501), ...base })).not.toEqual([]);
  });

  test("rejects a missing introduction and reports the current count", () => {
    const problems = publishProblems({ introduction: null, ...base });
    expect(problems.join()).toContain("0 字");
  });

  test("rejects a whitespace-only introduction — 200 spaces render as nothing", () => {
    const problems = publishProblems({ introduction: " ".repeat(200), ...base });
    expect(problems.join()).toContain("0 字");
  });

  test("requires at least one director", () => {
    const problems = publishProblems({ introduction: zh(300), directorCount: 0 });
    expect(problems.join()).toContain("导演");
  });

  // The note is capped and optional — the inverse of the introduction's
  // floor. Absent must publish; over-long must not.
  test("publishes without an editorial note", () => {
    expect(publishProblems({ introduction: zh(300), ...base })).toEqual([]);
    expect(publishProblems({ introduction: zh(300), editorialNote: null, ...base })).toEqual([]);
    expect(publishProblems({ introduction: zh(300), editorialNote: "", ...base })).toEqual([]);
  });

  // Derived from the constant, not hardcoded: a literal bound here is how
  // the counters came to describe the wrong field after the split.
  test("accepts a note at the ceiling and rejects one past it", () => {
    const at = zh(EDITORIAL_NOTE_MAX);
    const over = zh(EDITORIAL_NOTE_MAX + 1);
    expect(publishProblems({ introduction: zh(300), editorialNote: at, ...base })).toEqual([]);
    expect(
      publishProblems({ introduction: zh(300), editorialNote: over, ...base }).join(),
    ).toContain("编辑札记");
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
    expect(publishEnProblems({ ...base, introductionEn: noteEn(119) })).not.toEqual([]);
    expect(publishEnProblems({ ...base, introductionEn: noteEn(120) })).toEqual([]);
    expect(publishEnProblems({ ...base, introductionEn: noteEn(350) })).toEqual([]);
    expect(publishEnProblems({ ...base, introductionEn: noteEn(351) })).not.toEqual([]);
  });

  test("requires an English title and reports the current word count", () => {
    const problems = publishEnProblems({ titleEn: "  ", introductionEn: null });
    expect(problems.join()).toContain("titleEn");
    expect(problems.join()).toContain("0 词");
  });

  test("the English note is optional and capped at its ceiling", () => {
    const base = { titleEn: "8½", introductionEn: noteEn(150) };
    expect(publishEnProblems(base)).toEqual([]);
    expect(publishEnProblems({ ...base, editorialNoteEn: noteEn(EDITORIAL_NOTE_EN_MAX) })).toEqual(
      [],
    );
    expect(
      publishEnProblems({ ...base, editorialNoteEn: noteEn(EDITORIAL_NOTE_EN_MAX + 1) }).join(),
    ).toContain("札记");
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
    isSilent: false,
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

  test("caps runtime below int4 territory", () => {
    expect(filmFormSchema.safeParse({ ...valid, runtimeMinutes: "138" }).success).toBe(true);
    expect(filmFormSchema.safeParse({ ...valid, runtimeMinutes: "3000000000" }).success).toBe(
      false,
    );
  });

  test("caps the introduction at 500 code points but allows drafts below 200", () => {
    expect(filmFormSchema.safeParse({ ...valid, introduction: "短".repeat(50) }).success).toBe(
      true,
    );
    expect(filmFormSchema.safeParse({ ...valid, introduction: "长".repeat(501) }).success).toBe(
      false,
    );
  });

  test("caps the editorial note at its own, lower ceiling", () => {
    const at = "短".repeat(EDITORIAL_NOTE_MAX);
    const over = "长".repeat(EDITORIAL_NOTE_MAX + 1);
    expect(filmFormSchema.safeParse({ ...valid, editorialNote: at }).success).toBe(true);
    expect(filmFormSchema.safeParse({ ...valid, editorialNote: over }).success).toBe(false);
    expect(EDITORIAL_NOTE_MAX).toBeLessThan(INTRODUCTION_MAX);
  });

  test("external ids accept bare ids, reject URLs and malformed values", () => {
    const ids = { tmdbId: "8329", imdbId: "tt0056801", doubanId: "1291560", wikidataId: "Q550027" };
    expect(filmFormSchema.safeParse({ ...valid, ...ids }).success).toBe(true);
    // empty strings mean "not set" — the form's default state must parse
    expect(
      filmFormSchema.safeParse({ ...valid, tmdbId: "", imdbId: "", doubanId: "", wikidataId: "" })
        .success,
    ).toBe(true);
    expect(filmFormSchema.safeParse({ ...valid, imdbId: "0056801" }).success).toBe(false);
    expect(
      filmFormSchema.safeParse({ ...valid, imdbId: "https://www.imdb.com/title/tt0056801/" })
        .success,
    ).toBe(false);
    expect(filmFormSchema.safeParse({ ...valid, tmdbId: "abc" }).success).toBe(false);
    // int4 bounds — out-of-range values must die here, not as a pg 22003
    expect(filmFormSchema.safeParse({ ...valid, tmdbId: "0" }).success).toBe(false);
    expect(filmFormSchema.safeParse({ ...valid, tmdbId: "2147483647" }).success).toBe(true);
    expect(filmFormSchema.safeParse({ ...valid, tmdbId: "2147483648" }).success).toBe(false);
    expect(
      filmFormSchema.safeParse({ ...valid, doubanId: "https://movie.douban.com/subject/1291560/" })
        .success,
    ).toBe(false);
    expect(filmFormSchema.safeParse({ ...valid, wikidataId: "550027" }).success).toBe(false);
    // lowercase q is normalized on save, so the schema tolerates it
    expect(filmFormSchema.safeParse({ ...valid, wikidataId: "q550027" }).success).toBe(true);
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
