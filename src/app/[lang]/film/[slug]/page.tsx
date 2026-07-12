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
  const slugs = await getPublishedFilmSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const film = await getPublishedFilmBySlug(slug);
  if (!film) return {};
  return {
    title: `${film.titleZh}（${film.year}）`,
    description: film.editorialNote?.slice(0, 120) ?? film.titleOriginal,
    alternates: {
      languages: languageAlternates(`/film/${slug}`, { en: film.statusEn === "published" }),
    },
  };
}

export default async function PublicFilmPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const film = await getPublishedFilmBySlug(slug);
  if (!film) notFound();
  return (
    <>
      <JsonLd data={filmJsonLd(film)} />
      <FilmPage
        film={film}
        actions={<MarkButtons filmId={film.id} labels={getDict("zh").markButtons} />}
      />
    </>
  );
}
