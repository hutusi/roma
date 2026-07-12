import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TranslationPending } from "@/components/i18n/translation-pending";
import { ListPage } from "@/components/list/list-page";
import { JsonLd } from "@/components/seo/json-ld";
import { FollowButton } from "@/components/site/follow-button";
import {
  getListStubBySlug,
  getPublishedListBySlug,
  getPublishedListSlugs,
} from "@/db/queries/public";
import { languageAlternates } from "@/i18n/alternates";
import { getDict } from "@/i18n/dict";
import { localePath } from "@/i18n/locales";
import { parseLocale } from "@/i18n/params";
import { listJsonLd } from "@/lib/structured-data";

// zh slug set for both locales — en-pending lists prerender as
// translation-pending stubs (ADR 0012).
export async function generateStaticParams() {
  const slugs = await getPublishedListSlugs();
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
  const en = locale === "en";
  if (!list) {
    if (en) {
      const stub = await getListStubBySlug(slug);
      if (stub) return { title: stub.titleEn ?? stub.title, robots: { index: false } };
    }
    return {};
  }
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
  if (!list) {
    if (locale === "en") {
      const stub = await getListStubBySlug(slug);
      if (stub) {
        return (
          <TranslationPending
            // The zh title is a proper noun — the one sanctioned zh
            // string on /en when titleEn hasn't been authored (ADR 0012).
            title={stub.titleEn ?? stub.title}
            zhHref={localePath("zh", `/list/${slug}`)}
          />
        );
      }
    }
    notFound();
  }
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
