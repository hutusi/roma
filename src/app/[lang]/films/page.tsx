import type { Metadata } from "next";
import { Suspense } from "react";
import { TitleCard } from "@/components/site/title-card";
import { getPublishedFilms, posterOf } from "@/db/queries/public";
import { countryToEn } from "@/i18n/countries";
import { localePath } from "@/i18n/locales";
import { parseLocale } from "@/i18n/params";
import { seoMetadata } from "@/lib/seo";
import { FilmsFilter } from "./films-filter";
import { COPY, type FilmCardData, FilmsView } from "./films-view";

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

export default async function FilmsIndexPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = parseLocale((await params).lang);
  const en = locale === "en";
  const t = COPY[locale];

  // One query; the catalogue is curated (hundreds at most), not a
  // database, so the whole locale-visible set is cheaper to hand the
  // island once at build than to re-query per filtered request.
  const allFilms = await getPublishedFilms(undefined, locale);
  const films: FilmCardData[] = allFilms.map((film) => {
    const poster = posterOf(film.media);
    const title = en ? (film.titleEn ?? film.titleOriginal) : film.titleZh;
    return {
      id: film.id,
      href: localePath(locale, `/film/${film.slug}`),
      title,
      subtitle: film.titleOriginal !== title ? film.titleOriginal : null,
      year: film.year,
      directorsLabel: film.filmDirectors
        .map((fd) => (en ? fd.director.name : (fd.director.nameZh ?? fd.director.name)))
        .join(en ? ", " : "、"),
      imageUrl: poster?.url ?? null,
      imageAlt: poster?.alt ?? null,
      // Countries are stored in Chinese; the ?country param speaks the
      // display language, so translate once here rather than per compare.
      countries: en ? film.countries.map(countryToEn) : film.countries,
    };
  });

  return (
    <div className="mx-auto max-w-3xl animate-fade-up px-6 pt-16">
      <TitleCard eyebrow={t.eyebrow} title={t.title} />
      <p className="mx-auto mt-6 max-w-[60ch] text-center text-ink-muted">{t.intro}</p>

      {/* The fallback is the full catalogue, not a spinner: it is what
          gets prerendered into the static HTML, so readers without JS and
          crawlers still get every film and every link. The island swaps in
          the filtered view once it can read the query on hydration. */}
      <Suspense fallback={<FilmsView locale={locale} films={films} />}>
        <FilmsFilter locale={locale} films={films} />
      </Suspense>
    </div>
  );
}
