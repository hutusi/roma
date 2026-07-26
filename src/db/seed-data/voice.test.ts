import { describe, expect, test } from "bun:test";
import {
  blocking,
  type Family,
  type Lang,
  type ProseUnit,
  proseUnits,
  runVoiceChecks,
} from "./voice";

/**
 * Two layers. The rules are unit-tested against inline fixtures, so they
 * have coverage independent of whatever the corpus happens to contain
 * today. Then the corpus itself is asserted — partly live, partly `todo`
 * while the register pass is still in flight (ADR 0017).
 */

const unit = (
  family: Family,
  lang: Lang,
  text: string,
  extra: Partial<ProseUnit> = {},
): ProseUnit => ({ id: "test:x", family, lang, text, ...extra });

/** Long enough to clear the introduction floor without saying anything. */
const filler = (n: number) => "字".repeat(n);
const fillerEn = (n: number) => Array.from({ length: n }, () => "word").join(" ");

const rulesHit = (u: ProseUnit) => runVoiceChecks([u]).map((f) => f.rule);

describe("introduction-length", () => {
  test("holds the introduction to its publish band in both languages", () => {
    expect(rulesHit(unit("film.introduction", "zh", filler(199)))).toContain("introduction-length");
    expect(rulesHit(unit("film.introduction", "zh", filler(501)))).toContain("introduction-length");
    expect(rulesHit(unit("film.introduction", "en", fillerEn(119)))).toContain(
      "introduction-length",
    );
  });
});

describe("introduction-identifies-film", () => {
  const meta = { year: 1963, directors: ["费德里科·费里尼"] };

  test("passes when the prose names both the director and the year", () => {
    const u = unit("film.introduction", "zh", `${filler(200)}费德里科·费里尼 1963`, meta);
    expect(rulesHit(u)).not.toContain("introduction-identifies-film");
  });

  test("fires when either is missing", () => {
    expect(
      rulesHit(unit("film.introduction", "zh", `${filler(200)}费德里科·费里尼`, meta)),
    ).toContain("introduction-identifies-film");
    expect(rulesHit(unit("film.introduction", "zh", `${filler(200)}1963`, meta))).toContain(
      "introduction-identifies-film",
    );
  });

  // Caught a real defect: the English 东京物语 introduction wrote
  // "Yasujiro Ozu" while directors.ts has "Yasujirō Ozu", so the page
  // showed one spelling in the link and another in the prose.
  test("is spelling-exact, which is the point", () => {
    const u = unit("film.introduction", "en", `${fillerEn(130)} Yasujiro Ozu 1953`, {
      year: 1953,
      directors: ["Yasujirō Ozu"],
    });
    expect(rulesHit(u)).toContain("introduction-identifies-film");
  });
});

describe("unfalsifiable-claim", () => {
  test("rejects claims staked against all of cinema", () => {
    expect(
      rulesHit(unit("film.introduction", "zh", `${filler(200)}电影史上最伟大的作品`)),
    ).toContain("unfalsifiable-claim");
    expect(
      rulesHit(unit("film.introduction", "en", `${fillerEn(130)} an undisputed masterpiece`)),
    ).toContain("unfalsifiable-claim");
  });

  test("allows a superlative bounded by the work itself", () => {
    const zh = unit("film.introduction", "zh", `${filler(200)}全片最好的几分钟大概在结尾`);
    expect(rulesHit(zh)).not.toContain("unfalsifiable-claim");
  });

  // The whole reason rules carry a family list: the note is where a view
  // belongs, so the same sentence must pass there.
  test("does not apply to the editorial note", () => {
    expect(rulesHit(unit("film.note", "zh", "电影史上最伟大的作品"))).not.toContain(
      "unfalsifiable-claim",
    );
  });
});

describe("addresses-the-reader", () => {
  test("rejects second person and imperatives in reference prose", () => {
    expect(rulesHit(unit("film.introduction", "zh", `${filler(200)}。你会看到`))).toContain(
      "addresses-the-reader",
    );
    expect(
      rulesHit(unit("film.introduction", "en", `${fillerEn(130)} watch it closely`)),
    ).toContain("addresses-the-reader");
  });

  test("does not apply to the editorial note", () => {
    expect(rulesHit(unit("film.note", "en", "Watch it for the staircase."))).not.toContain(
      "addresses-the-reader",
    );
  });

  // Cast credits and film titles capitalise mid-sentence; an address to the
  // reader does not. Without this, three correct career essays were flagged
  // for "In Our Time", "In Which We Serve" and "The Children Are Watching Us".
  test("does not mistake a capitalised title or name for an address", () => {
    const titles = unit(
      "person.careerEssay",
      "en",
      "He directed a segment of In Our Time, having co-directed In Which We Serve and written The Children Are Watching Us. You An-shun appears in the cast.",
    );
    expect(rulesHit(titles)).not.toContain("addresses-the-reader");
  });

  test("still catches an address that opens a sentence", () => {
    expect(
      rulesHit(unit("film.introduction", "en", `${fillerEn(130)}. We are shown the ending first.`)),
    ).toContain("addresses-the-reader");
  });
});

describe("en-em-dash", () => {
  // humanizer §14, as modified by its own Voice Calibration clause: a
  // writing sample outranks the rule and one exists for Chinese only.
  test("bans the rhetorical dash in English, at any length", () => {
    expect(rulesHit(unit("film.note", "en", "Wilder is cruel — and tender."))).toContain(
      "en-em-dash",
    );
    expect(rulesHit(unit("film.essay", "en", "A dash used as a pause – like this."))).toContain(
      "en-em-dash",
    );
  });

  // A numeric range is typography, not rhetoric. This exclusion was missing
  // at first, so every bio's date span fired and the noise hid real findings
  // across two batches of rewriting.
  test("allows an en dash between digits", () => {
    expect(
      rulesHit(unit("person.introduction", "en", "Italian director, 1920–1993.")),
    ).not.toContain("en-em-dash");
    expect(rulesHit(unit("film.essay", "en", "Shot over 1950–1952 in Rome."))).not.toContain(
      "en-em-dash",
    );
  });

  test("leaves Chinese alone, where the sample permits them", () => {
    expect(rulesHit(unit("film.note", "zh", "怀尔德刻薄——底下有怜悯。"))).not.toContain(
      "en-em-dash",
    );
  });
});

describe("note-ceiling", () => {
  test("caps the note and ignores the absence of one", () => {
    expect(rulesHit(unit("film.note", "zh", filler(401)))).toContain("note-ceiling");
    expect(rulesHit(unit("film.note", "zh", filler(400)))).not.toContain("note-ceiling");
  });
});

describe("the seeded corpus", () => {
  const findings = blocking(runVoiceChecks(proseUnits()));

  /** Films whose introduction has had the register pass (ADR 0017). */
  const REWRITTEN = [
    "otto-e-mezzo",
    "tokyo-story",
    "sunset-boulevard",
    "spring-in-a-small-town",
    "in-the-mood-for-love",
    "the-goddess",
  ];

  test("every rewritten introduction is clean", () => {
    const offenders = findings
      .filter((f) => f.family === "film.introduction")
      .filter((f) => REWRITTEN.includes(f.unit.replace("film:", "")))
      .map((f) => `${f.unit} (${f.lang}) ${f.rule}: ${f.detail}`);
    expect(offenders).toEqual([]);
  });

  test("every editorial note is within its ceiling", () => {
    const offenders = findings
      .filter((f) => f.rule === "note-ceiling")
      .map((f) => `${f.unit} (${f.lang}): ${f.detail}`);
    expect(offenders).toEqual([]);
  });

  // Turns live when the last of the 74 films, 63 people and 8 lists has
  // been through the register pass. Until then it would fail on prose
  // that is known to be waiting, which trains people to ignore it.
  test.todo("the whole corpus is clean", () => {
    expect(findings.map((f) => `${f.unit} (${f.lang}) ${f.rule}`)).toEqual([]);
  });
});
