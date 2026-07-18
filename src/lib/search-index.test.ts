import { describe, expect, test } from "bun:test";
import { buildSearchDocs, type SearchCorpus } from "./search-index";

const ZH_NOTE_SENTINEL = "费里尼在这部影片里把创作的困境本身拍成了电影";

const corpus: SearchCorpus = {
  films: [
    {
      slug: "otto-e-mezzo",
      titleZh: "八部半",
      titleZhHk: "八部半",
      titleZhTw: "八又二分之一",
      titleOriginal: "Otto e mezzo",
      titleEn: "8½",
      year: 1963,
      editorialNote: ZH_NOTE_SENTINEL,
      editorialNoteEn: "A director who cannot make his film.",
      filmDirectors: [{ director: { name: "Federico Fellini", nameZh: "费德里科·费里尼" } }],
      cast: [{ name: "Giulietta Masina", nameZh: "茱莉艾塔·玛西娜" }],
      filmTags: [{ tag: { slug: "modernism", nameZh: "现代主义", nameEn: "Modernism" } }],
    },
  ],
  people: [
    {
      slug: "giulietta-masina",
      name: "Giulietta Masina",
      nameZh: "茱莉艾塔·玛西娜",
      bio: "费里尼的银幕缪斯。",
      bioEn: "Fellini's screen muse.",
      primaryRole: "actor",
    },
  ],
  lists: [
    {
      slug: "fellini-primer",
      title: "费里尼入门",
      titleEn: "A Fellini Primer",
      theme: "从马戏团到罗马",
      themeEn: "From the circus to Rome",
    },
  ],
};

describe("buildSearchDocs zh", () => {
  const docs = buildSearchDocs("zh", corpus);
  const film = docs.find((d) => d.type === "film");
  if (!film) throw new Error("film doc missing");

  test("film doc carries every name variant: titles, people, tags", () => {
    for (const name of [
      "八部半",
      "八又二分之一",
      "Otto e mezzo",
      "8½",
      "Federico Fellini",
      "费德里科·费里尼",
      "Giulietta Masina",
      "茱莉艾塔·玛西娜",
      "现代主义",
      "Modernism",
    ]) {
      expect(film.names).toContain(name);
    }
    // 港译 duplicates the mainland title — deduped.
    expect(film.names.filter((n) => n === "八部半")).toHaveLength(1);
  });

  test("film doc: zh label, prose, sublabel, href, year", () => {
    expect(film.label).toBe("八部半");
    expect(film.prose).toBe(ZH_NOTE_SENTINEL);
    expect(film.href).toBe("/zh/film/otto-e-mezzo");
    expect(film.sublabel).toBe("Otto e mezzo · 1963 · 费德里科·费里尼");
    expect(film.year).toBe(1963);
  });

  test("actor-primary person links to the canonical /actor URL", () => {
    const person = docs.find((d) => d.type === "person");
    expect(person?.href).toBe("/zh/actor/giulietta-masina");
    expect(person?.label).toBe("茱莉艾塔·玛西娜");
    expect(person?.sublabel).toBe("演员");
  });

  test("tag docs derive from film attachments only", () => {
    const tags = docs.filter((d) => d.type === "tag");
    expect(tags.map((t) => t.label)).toEqual(["现代主义"]);
    expect(tags[0].href).toBe("/zh/films?tag=modernism");
  });

  test("deterministic order: films, people, lists, tags", () => {
    expect(docs.map((d) => d.type)).toEqual(["film", "person", "list", "tag"]);
  });
});

describe("buildSearchDocs en", () => {
  const docs = buildSearchDocs("en", corpus);

  test("no zh prose anywhere in the en index, while zh names remain matchable", () => {
    const json = JSON.stringify(docs);
    expect(json).not.toContain(ZH_NOTE_SENTINEL);
    expect(json).not.toContain("银幕缪斯");
    // Titles are names — the /en film page shows the 译名 table itself.
    expect(json).toContain("八部半");
    expect(json).toContain("费德里科·费里尼");
  });

  test("en labels and prose", () => {
    const film = docs.find((d) => d.type === "film");
    expect(film?.label).toBe("8½");
    expect(film?.prose).toBe("A director who cannot make his film.");
    const person = docs.find((d) => d.type === "person");
    expect(person?.label).toBe("Giulietta Masina");
    expect(person?.sublabel).toBe("Actor");
    const list = docs.find((d) => d.type === "list");
    expect(list?.label).toBe("A Fellini Primer");
    expect(list?.sublabel).toBe("From the circus to Rome");
    const tag = docs.find((d) => d.type === "tag");
    expect(tag?.label).toBe("Modernism");
  });

  test("a corpus without a tag's film yields no doc for that tag", () => {
    const noTags = buildSearchDocs("en", {
      ...corpus,
      films: [{ ...corpus.films[0], filmTags: [] }],
    });
    expect(noTags.filter((d) => d.type === "tag")).toHaveLength(0);
  });
});
