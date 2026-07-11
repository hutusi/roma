import type { MetadataRoute } from "next";
import {
  getPublishedDirectorSlugs,
  getPublishedFilmSlugs,
  getPublishedListSlugs,
} from "@/db/queries/public";
import { languageAlternates } from "@/i18n/alternates";
import { localePath } from "@/i18n/locales";
import { SITE_URL } from "@/lib/site";

/** Absolute-URL hreflang map (sitemaps don't get metadataBase). */
function alternatesFor(path: string, en: boolean) {
  return {
    languages: Object.fromEntries(
      Object.entries(languageAlternates(path, { en })).map(([lang, p]) => [
        lang,
        `${SITE_URL}${p === "/" ? "" : p}`,
      ]),
    ),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [filmSlugs, directorSlugs, listSlugs, enFilmSlugs, enDirectorSlugs, enListSlugs] =
    await Promise.all([
      getPublishedFilmSlugs(),
      getPublishedDirectorSlugs(),
      getPublishedListSlugs(),
      getPublishedFilmSlugs("en"),
      getPublishedDirectorSlugs("en"),
      getPublishedListSlugs("en"),
    ]);
  const enFilms = new Set(enFilmSlugs.map(({ slug }) => slug));
  const enDirectors = new Set(enDirectorSlugs.map(({ slug }) => slug));
  const enLists = new Set(enListSlugs.map(({ slug }) => slug));

  // Each en page gets its own entry; both locales' entries carry the
  // same hreflang cluster so crawlers pair them from either side.
  const entity = (
    path: string,
    en: boolean,
    changeFrequency: "weekly" | "monthly" | "yearly",
    priority: number,
  ): MetadataRoute.Sitemap => {
    const entries: MetadataRoute.Sitemap = [
      {
        url: `${SITE_URL}${path === "/" ? "" : path}`,
        changeFrequency,
        priority,
        alternates: alternatesFor(path, en),
      },
    ];
    if (en) {
      entries.push({
        url: `${SITE_URL}${localePath("en", path)}`,
        changeFrequency,
        priority,
        alternates: alternatesFor(path, en),
      });
    }
    return entries;
  };

  return [
    ...entity("/", true, "weekly", 1),
    ...entity("/lists", true, "weekly", 0.9),
    ...entity("/films", true, "weekly", 0.8),
    ...entity("/about", true, "yearly", 0.3),
    ...listSlugs.flatMap(({ slug }) => entity(`/list/${slug}`, enLists.has(slug), "monthly", 0.9)),
    ...filmSlugs.flatMap(({ slug }) => entity(`/film/${slug}`, enFilms.has(slug), "monthly", 0.7)),
    ...directorSlugs.flatMap(({ slug }) =>
      entity(`/director/${slug}`, enDirectors.has(slug), "monthly", 0.6),
    ),
  ];
}
