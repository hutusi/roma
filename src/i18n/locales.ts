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

/**
 * The same page in the other locale, from a URL pathname: swap the
 * first segment (/zh/x ↔ /en/x, ADR 0012 symmetry). Pathname only —
 * query strings are dropped on purpose: /films' `country` param is
 * locale-mapped (countries.ts), so carrying a query across would break
 * the filter. Returns null off-tree (/admin, /api, unknown locales);
 * callers render nothing.
 */
export function counterpartPath(pathname: string): { target: Locale; href: string } | null {
  const [, first, ...rest] = pathname.split("/");
  if (!first || !isLocale(first)) return null;
  const target: Locale = first === "zh" ? "en" : "zh";
  return { target, href: rest.length ? `/${target}/${rest.join("/")}` : `/${target}` };
}
