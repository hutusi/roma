import { describe, expect, test } from "bun:test";
import { seoMetadata } from "./seo";

describe("seoMetadata", () => {
  test("canonical is the locale's own URL, relative for metadataBase", () => {
    expect(seoMetadata("zh", "/films", { en: true }).alternates?.canonical).toBe("/zh/films");
    expect(seoMetadata("en", "/films", { en: true }).alternates?.canonical).toBe("/en/films");
    expect(seoMetadata("zh", "/", { en: true }).alternates?.canonical).toBe("/zh");
  });

  test("hreflang keeps the languageAlternates contract: x-default → zh, en only when published", () => {
    const both = seoMetadata("zh", "/film/otto-e-mezzo", { en: true }).alternates?.languages;
    expect(both).toEqual({
      "zh-CN": "/zh/film/otto-e-mezzo",
      en: "/en/film/otto-e-mezzo",
      "x-default": "/zh/film/otto-e-mezzo",
    });
    const zhOnly = seoMetadata("zh", "/film/pending", { en: false }).alternates?.languages;
    expect(zhOnly).not.toHaveProperty("en");
    expect(zhOnly?.["x-default"]).toBe("/zh/film/pending");
  });

  test("og identity is per-locale; twitter card is summary_large_image", () => {
    const zh = seoMetadata("zh", "/lists", { en: true });
    expect(zh.openGraph).toEqual({
      type: "website",
      siteName: "八部半",
      locale: "zh_CN",
      url: "/zh/lists",
    });
    const en = seoMetadata("en", "/film/otto-e-mezzo", { en: true, ogType: "video.movie" });
    expect(en.openGraph).toMatchObject({
      type: "video.movie",
      siteName: "Babuban",
      locale: "en_US",
      url: "/en/film/otto-e-mezzo",
    });
    expect(en.twitter).toEqual({ card: "summary_large_image" });
  });

  test("never sets title/description/images — Next inherits those and merges file-convention og images", () => {
    const meta = seoMetadata("zh", "/films", { en: true });
    expect(meta).not.toHaveProperty("title");
    expect(meta).not.toHaveProperty("description");
    expect(meta.openGraph).not.toHaveProperty("images");
    expect(meta.openGraph).not.toHaveProperty("title");
    expect(meta.twitter).not.toHaveProperty("images");
  });
});
