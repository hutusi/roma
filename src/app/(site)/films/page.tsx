import type { Metadata } from "next";
import { FilmCard } from "@/components/site/film-card";
import { TitleCard } from "@/components/site/title-card";
import { getPublishedFilms, posterOf } from "@/db/queries/public";

export const metadata: Metadata = {
  title: "影片",
  description: "八部半收录的全部影片——收录即推荐。",
};

const DECADES = [1920, 1930, 1940, 1950, 1960, 1970, 1980];

export default async function FilmsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ decade?: string; country?: string }>;
}) {
  const { decade: decadeParam, country } = await searchParams;
  const parsedDecade = Number(decadeParam);
  const decade = decadeParam && Number.isFinite(parsedDecade) ? parsedDecade : undefined;

  // One query; facet values and filtering both derive from it — the
  // catalogue is curated (hundreds at most), not a database.
  const allFilms = await getPublishedFilms();
  const countries = Array.from(new Set(allFilms.flatMap((f) => f.countries))).sort();
  const films = allFilms.filter(
    (f) =>
      (decade === undefined || (f.year >= decade && f.year <= decade + 9)) &&
      (!country || f.countries.includes(country)),
  );

  return (
    <div className="mx-auto max-w-3xl animate-fade-up px-6 pt-16">
      <TitleCard eyebrow="The Films" title="影片" />
      <p className="mx-auto mt-6 max-w-[60ch] text-center text-ink-muted">
        这里不是数据库。出现在这里，就是我们的推荐。
      </p>

      <form className="mt-10 flex justify-center gap-3" action="/films">
        <select
          name="decade"
          defaultValue={decadeParam ?? ""}
          className="h-9 border border-line bg-paper px-2 text-sm"
        >
          <option value="">全部年代</option>
          {DECADES.map((d) => (
            <option key={d} value={d}>
              {d} 年代
            </option>
          ))}
        </select>
        <select
          name="country"
          defaultValue={country ?? ""}
          className="h-9 border border-line bg-paper px-2 text-sm"
        >
          <option value="">全部地区</option>
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
          筛选
        </button>
      </form>

      <div className="mt-10 grid gap-4 pb-4 sm:grid-cols-2">
        {films.map((film) => {
          const poster = posterOf(film.media);
          return (
            <FilmCard
              key={film.id}
              slug={film.slug}
              titleZh={film.titleZh}
              titleOriginal={film.titleOriginal}
              year={film.year}
              directors={film.filmDirectors.map((fd) => fd.director.nameZh ?? fd.director.name)}
              imageUrl={poster?.url}
              imageAlt={poster?.alt}
            />
          );
        })}
        {films.length === 0 && (
          <p className="col-span-full text-center text-ink-muted">没有符合条件的影片。</p>
        )}
      </div>
    </div>
  );
}
