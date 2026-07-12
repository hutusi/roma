import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FilmPage } from "@/components/film/film-page";
import { JsonLd } from "@/components/seo/json-ld";
import { MarkButtons } from "@/components/site/mark-buttons";
import { getPublishedFilmBySlug, getPublishedFilmSlugs } from "@/db/queries/public";
import { languageAlternates } from "@/i18n/alternates";
import { getDict } from "@/i18n/dict";
import { localePath } from "@/i18n/locales";
import { parseLocale } from "@/i18n/params";
import { filmJsonLd } from "@/lib/structured-data";

export async function generateStaticParams({ params }: { params: { lang: string } }) {
  const locale = parseLocale(params.lang);
  const slugs = await getPublishedFilmSlugs(locale);
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = parseLocale(lang);
  const film = await getPublishedFilmBySlug(slug, locale);
  if (!film) return {};
  const en = locale === "en";
  return {
    title: en
      ? `${film.titleEn ?? film.titleOriginal} (${film.year})`
      : `${film.titleZh}（${film.year}）`,
    description: en
      ? (film.editorialNoteEn?.slice(0, 160) ?? film.titleOriginal)
      : (film.editorialNote?.slice(0, 120) ?? film.titleOriginal),
    alternates: {
      languages: languageAlternates(`/film/${slug}`, {
        en: en || film.statusEn === "published",
      }),
    },
  };
}

export default async function PublicFilmPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale = parseLocale(lang);
  const film = await getPublishedFilmBySlug(slug, locale);
  if (!film) notFound();
  return (
    <>
      <JsonLd data={filmJsonLd(film, locale)} />
      <FilmPage
        film={film}
        locale={locale}
        actions={
          <MarkButtons
            filmId={film.id}
            labels={getDict(locale).markButtons}
            signInHref={localePath(locale, "/sign-in")}
          />
        }
      />
    </>
  );
}
