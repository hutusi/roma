/**
 * Pure filtering logic for /films, split from the view so it is
 * unit-testable without rendering. Both the static server render and
 * the client island filter through here, so they cannot disagree.
 */

/**
 * Plain, already-localized card data. The server resolves titles, poster
 * and director names so the island never needs the media/director
 * relations — or the server-only query layer — on the client.
 *
 * `countries` is in the DISPLAY language, matching the ?country param, so
 * neither side has to map between editions to compare.
 */
export type FilmCardData = {
  id: string;
  href: string;
  title: string;
  subtitle: string | null;
  year: number;
  directorsLabel: string;
  imageUrl: string | null;
  imageAlt: string | null;
  countries: string[];
  isBlackAndWhite: boolean;
};

/** ?palette values are locale-neutral literals, shared by both editions. */
export type Palette = "bw" | "color";

export type Selection = { decade?: number; country?: string; palette?: Palette };

export function filterFilms(films: FilmCardData[], { decade, country, palette }: Selection) {
  return films.filter(
    (f) =>
      (decade === undefined || (f.year >= decade && f.year <= decade + 9)) &&
      (!country || f.countries.includes(country)) &&
      (palette === undefined || (palette === "bw") === f.isBlackAndWhite),
  );
}
