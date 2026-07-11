import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FilmPage } from "@/components/film/film-page";
import { MarkButtons } from "@/components/site/mark-buttons";
import { getPublishedFilmBySlug, getPublishedFilmSlugs } from "@/db/queries/public";
import { getDict } from "@/i18n/dict";

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
  };
}

export default async function EnPublicFilmPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const film = await getPublishedFilmBySlug(slug, "en");
  if (!film) notFound();
  return (
    <FilmPage
      film={film}
      locale="en"
      actions={
        <MarkButtons filmId={film.id} labels={getDict("en").markButtons} signInHref="/en/sign-in" />
      }
    />
  );
}
