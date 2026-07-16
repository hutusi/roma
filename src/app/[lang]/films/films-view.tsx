import { FilmCard } from "@/components/site/film-card";
import { type Locale, localePath } from "@/i18n/locales";

/**
 * Presentational shell for /films, shared by the static server render and
 * the client filtering island — which is why it takes the selection as
 * props and holds no hooks of its own. Filtering happens here so both
 * paths filter identically.
 */

export const COPY = {
  zh: {
    title: "影片",
    eyebrow: "The Films" as string | undefined,
    description: "八部半收录的全部影片——收录即推荐。",
    intro: "这里不是数据库。出现在这里，就是我们的推荐。",
    allDecades: "全部年代",
    decadeLabel: (d: number) => `${d} 年代`,
    allCountries: "全部地区",
    filter: "筛选",
    empty: "没有符合条件的影片。",
  },
  en: {
    title: "The Films",
    eyebrow: undefined as string | undefined,
    description: "Every film on Babuban — inclusion is the recommendation.",
    intro: "This is not a database. If a film appears here, it is our recommendation.",
    allDecades: "All decades",
    decadeLabel: (d: number) => `${d}s`,
    allCountries: "All countries",
    filter: "Filter",
    empty: "No films match this filter yet.",
  },
} as const;

const DECADES = [1920, 1930, 1940, 1950, 1960, 1970, 1980];

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
};

export type Selection = { decade?: number; country?: string };

export function filterFilms(films: FilmCardData[], { decade, country }: Selection) {
  return films.filter(
    (f) =>
      (decade === undefined || (f.year >= decade && f.year <= decade + 9)) &&
      (!country || f.countries.includes(country)),
  );
}

export function FilmsView({
  locale,
  films,
  selection = {},
}: {
  locale: Locale;
  films: FilmCardData[];
  /** Empty on the server: a static render can't know the query string. */
  selection?: Selection;
}) {
  const t = COPY[locale];
  const countries = Array.from(new Set(films.flatMap((f) => f.countries))).sort();
  const shown = filterFilms(films, selection);

  return (
    <>
      {/* A plain GET form, not an onChange handler: it keeps the filter in
          the URL (shareable, and what the island reads back), and it still
          navigates without JS — the page just renders unfiltered there. */}
      <form className="mt-10 flex justify-center gap-3" action={localePath(locale, "/films")}>
        <select
          name="decade"
          defaultValue={selection.decade ?? ""}
          className="h-9 border border-line bg-paper px-2 text-sm"
        >
          <option value="">{t.allDecades}</option>
          {DECADES.map((d) => (
            <option key={d} value={d}>
              {t.decadeLabel(d)}
            </option>
          ))}
        </select>
        <select
          name="country"
          defaultValue={selection.country ?? ""}
          className="h-9 border border-line bg-paper px-2 text-sm"
        >
          <option value="">{t.allCountries}</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-9 border border-ink px-4 text-sm tracking-[0.2em] transition-colors hover:border-brand hover:text-brand"
        >
          {t.filter}
        </button>
      </form>

      <div className="mt-10 grid gap-4 pb-4 sm:grid-cols-2">
        {shown.map((film) => (
          <FilmCard
            key={film.id}
            href={film.href}
            title={film.title}
            subtitle={film.subtitle}
            year={film.year}
            directorsLabel={film.directorsLabel}
            imageUrl={film.imageUrl}
            imageAlt={film.imageAlt}
          />
        ))}
        {shown.length === 0 && (
          <p className="col-span-full text-center text-ink-muted">{t.empty}</p>
        )}
      </div>
    </>
  );
}
