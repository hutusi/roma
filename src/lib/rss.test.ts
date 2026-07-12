import { describe, expect, test } from "bun:test";
import { type FeedFilm, renderFilmsFeed } from "./rss";

const film = (over: Partial<FeedFilm>): FeedFilm => ({
  slug: "otto-e-mezzo",
  titleZh: "八部半",
  titleEn: "8½",
  titleOriginal: "Otto e mezzo",
  editorialNote: "zh note",
  editorialNoteEn: "en note",
  publishedAt: new Date("2026-07-11T00:00:00Z"),
  publishedEnAt: new Date("2026-07-11T00:00:00Z"),
  ...over,
});

describe("renderFilmsFeed", () => {
  test("zh feed carries channel + item with absolute links and RFC-822 date", () => {
    const xml = renderFilmsFeed("zh", [film({})]);
    expect(xml).toContain("<title>八部半</title>");
    expect(xml).toContain("<language>zh-CN</language>");
    expect(xml).toContain("<link>https://babuban.com/zh/film/otto-e-mezzo</link>");
    expect(xml).toContain(
      '<guid isPermaLink="true">https://babuban.com/zh/film/otto-e-mezzo</guid>',
    );
    expect(xml).toContain("<pubDate>Sat, 11 Jul 2026 00:00:00 GMT</pubDate>");
    expect(xml).toContain("<description>zh note</description>");
    expect(xml).toContain('href="https://babuban.com/zh/rss.xml"');
  });

  test("en feed uses English fields and /en URLs", () => {
    const xml = renderFilmsFeed("en", [film({})]);
    expect(xml).toContain("<title>Babuban</title>");
    expect(xml).toContain("<language>en</language>");
    expect(xml).toContain("<link>https://babuban.com/en/film/otto-e-mezzo</link>");
    expect(xml).toContain("<description>en note</description>");
    expect(xml).toContain('href="https://babuban.com/en/rss.xml"');
  });

  test("escapes XML metacharacters in titles and notes", () => {
    const xml = renderFilmsFeed("zh", [
      film({ titleZh: "R&D <film>", editorialNote: 'a "quote" & <tag>' }),
    ]);
    expect(xml).toContain("<title>R&amp;D &lt;film&gt;</title>");
    expect(xml).toContain("a &quot;quote&quot; &amp; &lt;tag&gt;");
    // no raw metacharacter leaked into element text
    expect(xml).not.toContain("<film>");
  });

  test("omits pubDate when the publish timestamp is missing", () => {
    const xml = renderFilmsFeed("zh", [film({ publishedAt: null })]);
    expect(xml).not.toContain("<pubDate>");
  });
});
