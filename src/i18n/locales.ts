export type Locale = "zh" | "en";

/**
 * Maps a canonical (zh) path to its locale's URL. zh lives at the root
 * (launched URLs are immutable); en lives under the /en prefix.
 */
export function localePath(locale: Locale, path: string): string {
  if (locale === "zh") return path;
  return path === "/" ? "/en" : `/en${path}`;
}
