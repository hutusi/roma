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
  imageColor: string | null;
  countries: string[];
  isBlackAndWhite: boolean;
  /** `label` is already localized; `slug` matches the ?tag param in both editions. */
  tags: { slug: string; label: string }[];
};

/** ?palette values are locale-neutral literals, shared by both editions. */
export type Palette = "bw" | "color";

export type Selection = { decade?: number; country?: string; palette?: Palette; tag?: string };

/** Parses the filter out of a query string; anything malformed is ignored. */
export function parseSelection(params: URLSearchParams): Selection {
  const decadeParam = params.get("decade");
  const parsed = Number(decadeParam);
  const palette = params.get("palette");
  return {
    decade: decadeParam && Number.isInteger(parsed) ? parsed : undefined,
    country: params.get("country") || undefined,
    palette: palette === "bw" || palette === "color" ? palette : undefined,
    tag: params.get("tag") || undefined,
  };
}

/** The selection as query parameters (empty values dropped), for the URL. */
export function selectionParams(selection: Selection): URLSearchParams {
  const params = new URLSearchParams();
  if (selection.decade !== undefined) params.set("decade", String(selection.decade));
  if (selection.country) params.set("country", selection.country);
  if (selection.palette) params.set("palette", selection.palette);
  if (selection.tag) params.set("tag", selection.tag);
  return params;
}

export const isFiltered = (s: Selection) =>
  s.decade !== undefined || Boolean(s.country || s.palette || s.tag);

/** The decades the catalogue actually spans — never an option that matches nothing. */
export function decadesOf(films: FilmCardData[]): number[] {
  return [...new Set(films.map((f) => Math.floor(f.year / 10) * 10))].sort((a, b) => a - b);
}

export function filterFilms(films: FilmCardData[], { decade, country, palette, tag }: Selection) {
  return films.filter(
    (f) =>
      (decade === undefined || (f.year >= decade && f.year <= decade + 9)) &&
      (!country || f.countries.includes(country)) &&
      (palette === undefined || (palette === "bw") === f.isBlackAndWhite) &&
      (!tag || f.tags.some((t) => t.slug === tag)),
  );
}
