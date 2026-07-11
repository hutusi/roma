import type { Metadata } from "next";
import { FilmCard } from "@/components/site/film-card";
import { TitleCard } from "@/components/site/title-card";
import { getPublishedFilms, posterOf } from "@/db/queries/public";
import { countryToEn, countryToZh } from "@/i18n/countries";

export const metadata: Metadata = {
  title: "Films",
  description: "Every film on Babuban — inclusion is the recommendation.",
};

const DECADES = [1920, 1930, 1940, 1950, 1960, 1970, 1980];

export default async function EnFilmsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ decade?: string; country?: string }>;
}) {
  const { decade: decadeParam, country: countryParam } = await searchParams;
  const parsedDecade = Number(decadeParam);
  const decade = decadeParam && Number.isFinite(parsedDecade) ? parsedDecade : undefined;
  // Filter params use English names; countries are stored in Chinese.
  const country = countryParam ? countryToZh(countryParam) : undefined;

  // One query; facet values and filtering both derive from it — the
  // catalogue is curated (hundreds at most), not a database.
  const allFilms = await getPublishedFilms(undefined, "en");
  const countries = Array.from(new Set(allFilms.flatMap((f) => f.countries)))
    .map(countryToEn)
    .sort();
  const films = allFilms.filter(
    (f) =>
      (decade === undefined || (f.year >= decade && f.year <= decade + 9)) &&
      (!country || f.countries.includes(country)),
  );

  return (
    <div className="mx-auto max-w-3xl animate-fade-up px-6 pt-16">
      <TitleCard title="The Films" />
      <p className="mx-auto mt-6 max-w-[60ch] text-center text-ink-muted">
        This is not a database. If a film appears here, it is our recommendation.
      </p>

      <form className="mt-10 flex justify-center gap-3" action="/en/films">
        <select
          name="decade"
          defaultValue={decadeParam ?? ""}
          className="h-9 border border-line bg-paper px-2 text-sm"
        >
          <option value="">All decades</option>
          {DECADES.map((d) => (
            <option key={d} value={d}>
              {d}s
            </option>
          ))}
        </select>
        <select
          name="country"
          defaultValue={countryParam ?? ""}
          className="h-9 border border-line bg-paper px-2 text-sm"
        >
          <option value="">All countries</option>
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
          Filter
        </button>
      </form>

      <div className="mt-10 grid gap-4 pb-4 sm:grid-cols-2">
        {films.map((film) => {
          const poster = posterOf(film.media);
          const title = film.titleEn ?? film.titleOriginal;
          return (
            <FilmCard
              key={film.id}
              href={`/en/film/${film.slug}`}
              title={title}
              subtitle={film.titleOriginal !== title ? film.titleOriginal : null}
              year={film.year}
              directorsLabel={film.filmDirectors.map((fd) => fd.director.name).join(", ")}
              imageUrl={poster?.url}
              imageAlt={poster?.alt}
            />
          );
        })}
        {films.length === 0 && (
          <p className="col-span-full text-center text-ink-muted">
            No films match this filter yet.
          </p>
        )}
      </div>
    </div>
  );
}
