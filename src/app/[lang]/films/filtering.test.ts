import { describe, expect, test } from "bun:test";
import {
  decadesOf,
  type FilmCardData,
  filterFilms,
  isFiltered,
  parseSelection,
  selectionParams,
} from "./filtering";

function card(over: Partial<FilmCardData> & Pick<FilmCardData, "id">): FilmCardData {
  return {
    href: `/zh/film/${over.id}`,
    title: over.id,
    subtitle: null,
    year: 1950,
    directorsLabel: "",
    imageUrl: null,
    imageAlt: null,
    countries: [],
    isBlackAndWhite: true,
    tags: [],
    ...over,
  };
}

const modernism = { slug: "modernism", label: "现代主义" };

const films = [
  card({ id: "otto-e-mezzo", year: 1963, countries: ["意大利", "法国"], tags: [modernism] }),
  card({
    id: "psycho",
    year: 1960,
    countries: ["美国"],
    tags: [{ slug: "suspense", label: "悬疑" }],
  }),
  card({ id: "giulietta", year: 1965, countries: ["意大利"], isBlackAndWhite: false }),
];

const ids = (list: FilmCardData[]) => list.map((f) => f.id);

describe("filterFilms", () => {
  test("no selection returns everything", () => {
    expect(filterFilms(films, {})).toHaveLength(3);
  });

  test("decade spans exactly its ten years", () => {
    expect(ids(filterFilms(films, { decade: 1960 }))).toEqual([
      "otto-e-mezzo",
      "psycho",
      "giulietta",
    ]);
    expect(filterFilms(films, { decade: 1950 })).toHaveLength(0);
  });

  test("country matches any of a film's countries", () => {
    expect(ids(filterFilms(films, { country: "法国" }))).toEqual(["otto-e-mezzo"]);
    expect(ids(filterFilms(films, { country: "意大利" }))).toEqual(["otto-e-mezzo", "giulietta"]);
  });

  test("palette splits the catalogue by isBlackAndWhite", () => {
    expect(ids(filterFilms(films, { palette: "bw" }))).toEqual(["otto-e-mezzo", "psycho"]);
    expect(ids(filterFilms(films, { palette: "color" }))).toEqual(["giulietta"]);
  });

  test("tag matches by slug; films without the tag drop out", () => {
    expect(ids(filterFilms(films, { tag: "modernism" }))).toEqual(["otto-e-mezzo"]);
    expect(filterFilms(films, { tag: "film-noir" })).toHaveLength(0);
  });

  test("facets combine with AND", () => {
    expect(
      ids(filterFilms(films, { decade: 1960, country: "意大利", palette: "bw", tag: "modernism" })),
    ).toEqual(["otto-e-mezzo"]);
  });
});

describe("selection ↔ query string", () => {
  test("parses every facet and ignores junk", () => {
    expect(
      parseSelection(new URLSearchParams("decade=1960&country=法国&palette=bw&tag=modernism")),
    ).toEqual({ decade: 1960, country: "法国", palette: "bw", tag: "modernism" });
    expect(parseSelection(new URLSearchParams("decade=abc&palette=sepia"))).toEqual({
      decade: undefined,
      country: undefined,
      palette: undefined,
      tag: undefined,
    });
  });

  test("round-trips, dropping empty facets", () => {
    const selection = { decade: 1950, tag: "neorealism" };
    expect(selectionParams(selection).toString()).toBe("decade=1950&tag=neorealism");
    expect(parseSelection(selectionParams(selection))).toMatchObject(selection);
    expect(selectionParams({}).toString()).toBe("");
  });

  test("isFiltered is false only for the empty selection", () => {
    expect(isFiltered({})).toBe(false);
    expect(isFiltered({ decade: 1920 })).toBe(true);
    expect(isFiltered({ tag: "x" })).toBe(true);
  });
});

describe("decadesOf", () => {
  test("lists the decades the catalogue spans, sorted — including the 1990s and 2000s", () => {
    expect(
      decadesOf([
        card({ id: "a", year: 2000 }),
        card({ id: "b", year: 1963 }),
        card({ id: "c", year: 1991 }),
        card({ id: "d", year: 1965 }),
      ]),
    ).toEqual([1960, 1990, 2000]);
  });
});
