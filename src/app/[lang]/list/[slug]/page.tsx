import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListPage } from "@/components/list/list-page";
import { JsonLd } from "@/components/seo/json-ld";
import { FollowButton } from "@/components/site/follow-button";
import { getPublishedListBySlug, getPublishedListSlugs } from "@/db/queries/public";
import { languageAlternates } from "@/i18n/alternates";
import { getDict } from "@/i18n/dict";
import { localePath } from "@/i18n/locales";
import { parseLocale } from "@/i18n/params";
import { listJsonLd } from "@/lib/structured-data";

export async function generateStaticParams({ params }: { params: { lang: string } }) {
  const slugs = await getPublishedListSlugs(parseLocale(params.lang));
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = parseLocale(lang);
  const list = await getPublishedListBySlug(slug, locale);
  if (!list) return {};
  const en = locale === "en";
  return {
    title: en ? (list.titleEn ?? list.title) : list.title,
    description: en
      ? (list.themeEn ?? `${list.items.length} films`)
      : (list.theme ?? `${list.items.length} 部影片`),
    alternates: {
      languages: languageAlternates(`/list/${slug}`, {
        en: en || list.statusEn === "published",
      }),
    },
  };
}

export default async function PublicListPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale = parseLocale(lang);
  const list = await getPublishedListBySlug(slug, locale);
  if (!list) notFound();
  return (
    <>
      <JsonLd data={listJsonLd(list, locale)} />
      <ListPage
        list={list}
        locale={locale}
        actions={
          <FollowButton
            listId={list.id}
            labels={getDict(locale).followButton}
            signInHref={localePath(locale, "/sign-in")}
          />
        }
      />
    </>
  );
}
