import { localePath } from "./locales";

/**
 * hreflang map for a canonical (zh) path. zh is always present and is
 * also x-default (the site's primary audience); en joins only when the
 * English edition actually exists — a hreflang pointing at a 404 is
 * worse than none. Paths are relative: metadata composes them with
 * metadataBase, and the sitemap prefixes SITE_URL itself.
 */
export function languageAlternates(path: string, options: { en: boolean }) {
  return {
    "zh-CN": path,
    ...(options.en ? { en: localePath("en", path) } : {}),
    "x-default": path,
  };
}
