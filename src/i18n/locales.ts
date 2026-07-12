export const LOCALES = ["zh", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** BCP 47 value for the <html lang> attribute per locale. */
export const HTML_LANG = { zh: "zh-CN", en: "en" } as const;

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Maps a canonical (locale-less) path to its locale's URL. Both locales
 * live under a symmetric prefix — /zh and /en (ADR 0012); the bare root
 * redirects to /zh in next.config.ts.
 */
export function localePath(locale: Locale, path: string): string {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}
