import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DirectorPage } from "@/components/director/director-page";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublishedDirectorBySlug, getPublishedDirectorSlugs } from "@/db/queries/public";
import { languageAlternates } from "@/i18n/alternates";
import { parseLocale } from "@/i18n/params";
import { directorJsonLd } from "@/lib/structured-data";

export async function generateStaticParams({ params }: { params: { lang: string } }) {
  const slugs = await getPublishedDirectorSlugs(parseLocale(params.lang));
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = parseLocale(lang);
  const director = await getPublishedDirectorBySlug(slug, locale);
  if (!director) return {};
  const en = locale === "en";
  return {
    title: en ? director.name : (director.nameZh ?? director.name),
    description: en
      ? (director.bioEn?.slice(0, 160) ?? director.name)
      : (director.bio?.slice(0, 120) ?? director.name),
    alternates: {
      languages: languageAlternates(`/director/${slug}`, {
        en: en || director.statusEn === "published",
      }),
    },
  };
}

export default async function PublicDirectorPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale = parseLocale(lang);
  const director = await getPublishedDirectorBySlug(slug, locale);
  if (!director) notFound();
  return (
    <>
      <JsonLd data={directorJsonLd(director, locale)} />
      <DirectorPage director={director} locale={locale} />
    </>
  );
}
