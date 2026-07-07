import type { MetadataRoute } from "next";
import {
  getPublishedDirectorSlugs,
  getPublishedFilmSlugs,
  getPublishedListSlugs,
} from "@/db/queries/public";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [filmSlugs, directorSlugs, listSlugs] = await Promise.all([
    getPublishedFilmSlugs(),
    getPublishedDirectorSlugs(),
    getPublishedListSlugs(),
  ]);

  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/lists`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/films`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.3 },
    ...listSlugs.map(({ slug }) => ({
      url: `${SITE_URL}/list/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...filmSlugs.map(({ slug }) => ({
      url: `${SITE_URL}/film/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...directorSlugs.map(({ slug }) => ({
      url: `${SITE_URL}/director/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
