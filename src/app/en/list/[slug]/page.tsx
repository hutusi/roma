import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListPage } from "@/components/list/list-page";
import { JsonLd } from "@/components/seo/json-ld";
import { FollowButton } from "@/components/site/follow-button";
import { getPublishedListBySlug, getPublishedListSlugs } from "@/db/queries/public";
import { languageAlternates } from "@/i18n/alternates";
import { getDict } from "@/i18n/dict";
import { listJsonLd } from "@/lib/structured-data";

export async function generateStaticParams() {
  const slugs = await getPublishedListSlugs("en");
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const list = await getPublishedListBySlug(slug, "en");
  if (!list) return {};
  return {
    title: list.titleEn ?? list.title,
    description: list.themeEn ?? `${list.items.length} films`,
    alternates: { languages: languageAlternates(`/list/${slug}`, { en: true }) },
  };
}

export default async function EnPublicListPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const list = await getPublishedListBySlug(slug, "en");
  if (!list) notFound();
  return (
    <>
      <JsonLd data={listJsonLd(list, "en")} />
      <ListPage
        list={list}
        locale="en"
        actions={
          <FollowButton
            listId={list.id}
            labels={getDict("en").followButton}
            signInHref="/en/sign-in"
          />
        }
      />
    </>
  );
}
