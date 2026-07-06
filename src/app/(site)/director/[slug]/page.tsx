import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DirectorPage } from "@/components/director/director-page";
import {
  getPublishedDirectorBySlug,
  getPublishedDirectorSlugs,
} from "@/db/queries/public";

export async function generateStaticParams() {
  const slugs = await getPublishedDirectorSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const director = await getPublishedDirectorBySlug(slug);
  if (!director) return {};
  return {
    title: director.nameZh ?? director.name,
    description: director.bio?.slice(0, 120) ?? director.name,
  };
}

export default async function PublicDirectorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const director = await getPublishedDirectorBySlug(slug);
  if (!director) notFound();
  return <DirectorPage director={director} />;
}
