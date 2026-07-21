import type { Locale } from "@/i18n/locales";

/**
 * External identifiers live in the DB as bare ids (tt0056801, 1291560,
 * Q550027, 550) and become URLs only here — one place to change if a
 * site ever moves. Display policy (ADR 0016): Douban and IMDb are the
 * reader-facing pair, ordered per locale; TMDB and Wikidata are plumbing
 * (re-import handle / sameAs) and never rendered.
 */

export type FilmExternalIds = {
  tmdbId: number | null;
  imdbId: string | null;
  doubanId: string | null;
  wikidataId: string | null;
};

export const doubanUrl = (id: string) => `https://movie.douban.com/subject/${id}/`;
export const imdbUrl = (id: string) => `https://www.imdb.com/title/${id}/`;
export const tmdbUrl = (id: number) => `https://www.themoviedb.org/movie/${id}`;
export const wikidataUrl = (id: string) => `https://www.wikidata.org/wiki/${id}`;

/** All present ids as URLs, for the Movie JSON-LD sameAs array. */
export function filmSameAs(film: FilmExternalIds): string[] {
  return [
    film.imdbId ? imdbUrl(film.imdbId) : null,
    film.doubanId ? doubanUrl(film.doubanId) : null,
    film.wikidataId ? wikidataUrl(film.wikidataId) : null,
    film.tmdbId ? tmdbUrl(film.tmdbId) : null,
  ].filter((u): u is string => u !== null);
}

export type ExternalLink = { key: "douban" | "imdb"; url: string };

/**
 * The visible 外部链接 row. The home-audience site leads: 豆瓣 first on
 * /zh, IMDb first on /en (IMDb is blocked in the mainland; Douban is a
 * zh-only site). Labels come from the locale dictionary.
 */
export function externalLinks(film: FilmExternalIds, locale: Locale): ExternalLink[] {
  const douban: ExternalLink | null = film.doubanId
    ? { key: "douban", url: doubanUrl(film.doubanId) }
    : null;
  const imdb: ExternalLink | null = film.imdbId ? { key: "imdb", url: imdbUrl(film.imdbId) } : null;
  const ordered = locale === "en" ? [imdb, douban] : [douban, imdb];
  return ordered.filter((l): l is ExternalLink => l !== null);
}
