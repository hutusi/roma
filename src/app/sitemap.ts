import type { MetadataRoute } from "next";
import {
  getPublishedFilmSlugs,
  getPublishedListSlugs,
  getPublishedPersonSlugs,
} from "@/db/queries/public";
import { languageAlternates } from "@/i18n/alternates";
import { localePath } from "@/i18n/locales";
import { personPath } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";

/** Absolute-URL hreflang map (sitemaps don't get metadataBase). */
function alternatesFor(path: string, en: boolean) {
  return {
    languages: Object.fromEntries(
      Object.entries(languageAlternates(path, { en })).map(([lang, p]) => [
        lang,
        `${SITE_URL}${p}`,
      ]),
    ),
  };
}

function latest(rows: { updatedAt: Date }[]): Date | undefined {
  if (!rows.length) return undefined;
  return rows.reduce(
    (max, { updatedAt }) => (updatedAt > max ? updatedAt : max),
    rows[0].updatedAt,
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [filmSlugs, personSlugs, listSlugs, enFilmSlugs, enPersonSlugs, enListSlugs] =
    await Promise.all([
      getPublishedFilmSlugs(),
      getPublishedPersonSlugs(),
      getPublishedListSlugs(),
      getPublishedFilmSlugs("en"),
      getPublishedPersonSlugs("en"),
      getPublishedListSlugs("en"),
    ]);
  const enFilms = new Set(enFilmSlugs.map(({ slug }) => slug));
  const enPeople = new Set(enPersonSlugs.map(({ slug }) => slug));
  const enLists = new Set(enListSlugs.map(({ slug }) => slug));

  // Each en page gets its own entry; both locales' entries carry the
  // same hreflang cluster so crawlers pair them from either side.
  // lastModified is shared too: one row holds both editions.
  const entity = (
    path: string,
    en: boolean,
    changeFrequency: "weekly" | "monthly" | "yearly",
    priority: number,
    lastModified?: Date,
  ): MetadataRoute.Sitemap => {
    const entries: MetadataRoute.Sitemap = [
      {
        url: `${SITE_URL}${localePath("zh", path)}`,
        changeFrequency,
        priority,
        alternates: alternatesFor(path, en),
        ...(lastModified ? { lastModified } : {}),
      },
    ];
    if (en) {
      entries.push({
        url: `${SITE_URL}${localePath("en", path)}`,
        changeFrequency,
        priority,
        alternates: alternatesFor(path, en),
        ...(lastModified ? { lastModified } : {}),
      });
    }
    return entries;
  };

  // Listing pages move whenever any of their members does; /about has
  // no data-driven freshness signal, so it carries no lastModified.
  const filmsTouched = latest(filmSlugs);
  const listsTouched = latest(listSlugs);
  const homeTouched = latest([...filmSlugs, ...listSlugs]);

  return [
    ...entity("/", true, "weekly", 1, homeTouched),
    ...entity("/lists", true, "weekly", 0.9, listsTouched),
    ...entity("/films", true, "weekly", 0.8, filmsTouched),
    ...entity("/about", true, "yearly", 0.3),
    ...listSlugs.flatMap(({ slug, updatedAt }) =>
      entity(`/list/${slug}`, enLists.has(slug), "monthly", 0.9, updatedAt),
    ),
    ...filmSlugs.flatMap(({ slug, updatedAt }) =>
      entity(`/film/${slug}`, enFilms.has(slug), "monthly", 0.7, updatedAt),
    ),
    // Canonical segment per person; the other segment 308s and stays out.
    ...personSlugs.flatMap((person) =>
      entity(personPath(person), enPeople.has(person.slug), "monthly", 0.6, person.updatedAt),
    ),
  ];
}
