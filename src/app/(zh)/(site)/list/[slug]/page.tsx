import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListPage } from "@/components/list/list-page";
import { FollowButton } from "@/components/site/follow-button";
import { getPublishedListBySlug, getPublishedListSlugs } from "@/db/queries/public";

export async function generateStaticParams() {
  const slugs = await getPublishedListSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const list = await getPublishedListBySlug(slug);
  if (!list) return {};
  return {
    title: list.title,
    description: list.theme ?? `${list.items.length} 部影片`,
  };
}

export default async function PublicListPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const list = await getPublishedListBySlug(slug);
  if (!list) notFound();
  return <ListPage list={list} actions={<FollowButton listId={list.id} />} />;
}
