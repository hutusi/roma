import type { Metadata } from "next";
import { FilmCard } from "@/components/site/film-card";
import { TitleCard } from "@/components/site/title-card";
import { getPublishedFilms, posterOf } from "@/db/queries/public";
import { countryToEn, countryToZh } from "@/i18n/countries";
import type { Locale } from "@/i18n/locales";
import { localePath } from "@/i18n/locales";
import { parseLocale } from "@/i18n/params";
import { seoMetadata } from "@/lib/seo";

const COPY = {
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = parseLocale((await params).lang);
  const t = COPY[locale];
  return {
    title: t.title,
    description: t.description,
    ...seoMetadata(locale, "/films", { en: true }),
  };
}

const DECADES = [1920, 1930, 1940, 1950, 1960, 1970, 1980];

export default async function FilmsIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ decade?: string; country?: string }>;
}) {
  const locale: Locale = parseLocale((await params).lang);
  const en = locale === "en";
  const t = COPY[locale];
  const { decade: decadeParam, country: countryParam } = await searchParams;
  const parsedDecade = Number(decadeParam);
  const decade = decadeParam && Number.isFinite(parsedDecade) ? parsedDecade : undefined;
  // Filter params use the display language; countries are stored in Chinese.
  const country = en && countryParam ? countryToZh(countryParam) : countryParam;

  // One query; facet values and filtering both derive from it — the
  // catalogue is curated (hundreds at most), not a database.
  const allFilms = await getPublishedFilms(undefined, locale);
  const zhCountries = Array.from(new Set(allFilms.flatMap((f) => f.countries)));
  const countries = (en ? zhCountries.map(countryToEn) : zhCountries).sort();
  const films = allFilms.filter(
    (f) =>
      (decade === undefined || (f.year >= decade && f.year <= decade + 9)) &&
      (!country || f.countries.includes(country)),
  );

  return (
    <div className="mx-auto max-w-3xl animate-fade-up px-6 pt-16">
      <TitleCard eyebrow={t.eyebrow} title={t.title} />
      <p className="mx-auto mt-6 max-w-[60ch] text-center text-ink-muted">{t.intro}</p>

      <form className="mt-10 flex justify-center gap-3" action={localePath(locale, "/films")}>
        <select
          name="decade"
          defaultValue={decadeParam ?? ""}
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
          defaultValue={countryParam ?? ""}
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
        {films.map((film) => {
          const poster = posterOf(film.media);
          const title = en ? (film.titleEn ?? film.titleOriginal) : film.titleZh;
          return (
            <FilmCard
              key={film.id}
              href={localePath(locale, `/film/${film.slug}`)}
              title={title}
              subtitle={film.titleOriginal !== title ? film.titleOriginal : null}
              year={film.year}
              directorsLabel={film.filmDirectors
                .map((fd) => (en ? fd.director.name : (fd.director.nameZh ?? fd.director.name)))
                .join(en ? ", " : "、")}
              imageUrl={poster?.url}
              imageAlt={poster?.alt}
            />
          );
        })}
        {films.length === 0 && (
          <p className="col-span-full text-center text-ink-muted">{t.empty}</p>
        )}
      </div>
    </div>
  );
}
