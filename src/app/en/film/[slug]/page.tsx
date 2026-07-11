import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FilmPage } from "@/components/film/film-page";
import { JsonLd } from "@/components/seo/json-ld";
import { MarkButtons } from "@/components/site/mark-buttons";
import { getPublishedFilmBySlug, getPublishedFilmSlugs } from "@/db/queries/public";
import { languageAlternates } from "@/i18n/alternates";
import { getDict } from "@/i18n/dict";
import { filmJsonLd } from "@/lib/structured-data";

export async function generateStaticParams() {
  const slugs = await getPublishedFilmSlugs("en");
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const film = await getPublishedFilmBySlug(slug, "en");
  if (!film) return {};
  return {
    title: `${film.titleEn ?? film.titleOriginal} (${film.year})`,
    description: film.editorialNoteEn?.slice(0, 160) ?? film.titleOriginal,
    alternates: { languages: languageAlternates(`/film/${slug}`, { en: true }) },
  };
}

export default async function EnPublicFilmPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const film = await getPublishedFilmBySlug(slug, "en");
  if (!film) notFound();
  return (
    <>
      <JsonLd data={filmJsonLd(film, "en")} />
      <FilmPage
        film={film}
        locale="en"
        actions={
          <MarkButtons
            filmId={film.id}
            labels={getDict("en").markButtons}
            signInHref="/en/sign-in"
          />
        }
      />
    </>
  );
}
