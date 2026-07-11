import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DirectorPage } from "@/components/director/director-page";
import { getPublishedDirectorBySlug, getPublishedDirectorSlugs } from "@/db/queries/public";
import { languageAlternates } from "@/i18n/alternates";

export async function generateStaticParams() {
  const slugs = await getPublishedDirectorSlugs("en");
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const director = await getPublishedDirectorBySlug(slug, "en");
  if (!director) return {};
  return {
    title: director.name,
    description: director.bioEn?.slice(0, 160) ?? director.name,
    alternates: { languages: languageAlternates(`/director/${slug}`) },
  };
}

export default async function EnPublicDirectorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const director = await getPublishedDirectorBySlug(slug, "en");
  if (!director) notFound();
  return <DirectorPage director={director} locale="en" />;
}
