import { describe, expect, test } from "bun:test";
import { externalLinks, filmSameAs } from "./external-ids";

const full = {
  tmdbId: 550,
  imdbId: "tt0056801",
  doubanId: "1291560",
  wikidataId: "Q550027",
};

const none = { tmdbId: null, imdbId: null, doubanId: null, wikidataId: null };

describe("filmSameAs", () => {
  test("emits every present id as a URL", () => {
    expect(filmSameAs(full)).toEqual([
      "https://www.imdb.com/title/tt0056801/",
      "https://movie.douban.com/subject/1291560/",
      "https://www.wikidata.org/wiki/Q550027",
      "https://www.themoviedb.org/movie/550",
    ]);
  });

  test("omits missing ids and can be empty", () => {
    expect(filmSameAs({ ...none, wikidataId: "Q550027" })).toEqual([
      "https://www.wikidata.org/wiki/Q550027",
    ]);
    expect(filmSameAs(none)).toEqual([]);
  });
});

describe("externalLinks", () => {
  test("zh leads with 豆瓣, en leads with IMDb", () => {
    expect(externalLinks(full, "zh").map((l) => l.key)).toEqual(["douban", "imdb"]);
    expect(externalLinks(full, "en").map((l) => l.key)).toEqual(["imdb", "douban"]);
  });

  test("never surfaces TMDB or Wikidata, drops missing ids", () => {
    expect(externalLinks({ ...none, tmdbId: 550, wikidataId: "Q1" }, "zh")).toEqual([]);
    expect(externalLinks({ ...none, imdbId: "tt0056801" }, "zh")).toEqual([
      { key: "imdb", url: "https://www.imdb.com/title/tt0056801/" },
    ]);
  });
});
