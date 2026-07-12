import { describe, expect, test } from "bun:test";
import type { PublicDirector, PublicFilm, PublicList } from "@/db/queries/public";
import { directorJsonLd, filmJsonLd, listJsonLd, serializeJsonLd } from "./structured-data";

const fellini = {
  slug: "fellini",
  name: "Federico Fellini",
  nameZh: "费德里科·费里尼",
  status: "published",
  statusEn: "published",
};

const film = {
  slug: "otto-e-mezzo",
  titleZh: "八部半",
  titleEn: "8½",
  titleOriginal: "Otto e mezzo",
  year: 1963,
  countries: ["法国"],
  runtimeMinutes: 138,
  editorialNote: "zh note",
  editorialNoteEn: "en note",
  filmDirectors: [{ director: fellini }],
  media: [{ kind: "poster", url: "https://blob.example/8.jpg" }],
} as unknown as PublicFilm;

const graphOf = (node: Record<string, unknown>) => node["@graph"] as Record<string, unknown>[];

describe("filmJsonLd", () => {
  test("zh emits a Movie with localized fields and a 3-step breadcrumb", () => {
    const [movie, crumbs] = graphOf(filmJsonLd(film, "zh"));
    expect(movie["@type"]).toBe("Movie");
    expect(movie.name).toBe("八部半");
    expect(movie.url).toBe("https://babuban.com/zh/film/otto-e-mezzo");
    expect(movie.dateCreated).toBe("1963");
    expect(movie.duration).toBe("PT138M");
    expect(movie.image).toBe("https://blob.example/8.jpg");
    expect((movie.director as { url: string }[])[0].url).toBe(
      "https://babuban.com/zh/director/fellini",
    );
    expect((movie.countryOfOrigin as { name: string }[])[0].name).toBe("法国");
    expect(crumbs["@type"]).toBe("BreadcrumbList");
    expect((crumbs.itemListElement as unknown[]).length).toBe(3);
  });

  test("en uses English title, /en URLs, and English country names", () => {
    const [movie] = graphOf(filmJsonLd(film, "en"));
    expect(movie.name).toBe("8½");
    expect(movie.url).toBe("https://babuban.com/en/film/otto-e-mezzo");
    expect((movie.director as { url: string }[])[0].url).toBe(
      "https://babuban.com/en/director/fellini",
    );
    expect((movie.countryOfOrigin as { name: string }[])[0].name).toBe("France");
  });

  test("en does not link a co-director who isn't en-published", () => {
    const withDraftEnCoDirector = {
      ...film,
      filmDirectors: [{ director: { ...fellini, statusEn: "draft" } }],
    } as unknown as PublicFilm;
    const [movie] = graphOf(filmJsonLd(withDraftEnCoDirector, "en"));
    expect((movie.director as { url?: string }[])[0].url).toBeUndefined();
  });
});

describe("directorJsonLd", () => {
  test("emits a Person with name, alternateName, and jobTitle", () => {
    const director = {
      slug: "fellini",
      name: "Federico Fellini",
      nameZh: "费德里科·费里尼",
      bio: "生平",
      bioEn: "Life",
      media: [{ kind: "portrait", url: "https://blob.example/f.jpg" }],
    } as unknown as PublicDirector;
    const [person] = graphOf(directorJsonLd(director, "en"));
    expect(person["@type"]).toBe("Person");
    expect(person.name).toBe("Federico Fellini");
    expect(person.alternateName).toBe("费德里科·费里尼");
    expect(person.jobTitle).toBe("Film director");
    expect(person.url).toBe("https://babuban.com/en/director/fellini");
  });
});

describe("listJsonLd", () => {
  const list = {
    slug: "noir",
    title: "黑色电影",
    titleEn: "Film Noir",
    theme: "阴影里的道德",
    themeEn: "Morality in shadow",
    items: [
      {
        film: {
          slug: "a",
          titleZh: "甲",
          titleEn: "A",
          status: "published",
          statusEn: "published",
        },
      },
      { film: { slug: "b", titleZh: "乙", titleEn: "B", status: "published", statusEn: "draft" } },
    ],
  } as unknown as PublicList;

  test("en links only en-visible members but keeps every member in order", () => {
    const [itemList] = graphOf(listJsonLd(list, "en"));
    expect(itemList["@type"]).toBe("ItemList");
    expect(itemList.numberOfItems).toBe(2);
    const elements = itemList.itemListElement as { position: number; item?: string }[];
    expect(elements.length).toBe(2);
    expect(elements[0].item).toBe("https://babuban.com/en/film/a"); // en-published → linked
    expect(elements[1].item).toBeUndefined(); // zh-only member stays, unlinked on /en
  });
});

describe("serializeJsonLd", () => {
  test("escapes < so a value can't break out of the <script> element", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c/script>");
  });
});
