import type { Metadata } from "next";
import { TitleCard } from "@/components/site/title-card";
import { getPublishedFilms, posterOf } from "@/db/queries/public";
import { countryToEn } from "@/i18n/countries";
import { localePath } from "@/i18n/locales";
import { parseLocale } from "@/i18n/params";
import { seoMetadata } from "@/lib/seo";
import { COPY } from "./copy";
import { FilmsBrowser } from "./films-browser";
import type { FilmCardData } from "./filtering";

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
      imageColor: poster?.dominantColor ?? null,
      // Countries are stored in Chinese; the ?country param speaks the
      // display language, so translate once here rather than per compare.
      countries: en ? film.countries.map(countryToEn) : film.countries,
      isBlackAndWhite: film.isBlackAndWhite,
      tags: film.filmTags.map((ft) => ({
        slug: ft.tag.slug,
        label: en ? ft.tag.nameEn : ft.tag.nameZh,
      })),
    };
  });

  return (
    <div className="mx-auto max-w-3xl animate-fade-up px-6 pt-16">
      <TitleCard as="h1" eyebrow={t.eyebrow} title={t.title} />
      <p className="mx-auto mt-6 max-w-[60ch] text-center text-ink-muted">{t.intro}</p>

      {/* Prerenders the full catalogue — what crawlers and no-JS readers
          get — and filters on the client after hydration. */}
      <FilmsBrowser locale={locale} films={films} />
    </div>
  );
}
