import type { Metadata } from "next";
import { Suspense } from "react";
import { TitleCard } from "@/components/site/title-card";
import { getDict } from "@/i18n/dict";
import { parseLocale } from "@/i18n/params";
import { seoMetadata } from "@/lib/seo";
import { SearchPageBody, SearchPageWithParams } from "./search-page-client";

// Page-local copy stays with the page (dictionaries are for shared
// chrome; the result-list strings ARE shared chrome and live in
// dict.search).
const COPY = {
  zh: {
    title: "搜索",
    eyebrow: "Search" as string | undefined,
    description: "在八部半的影片、人物与片单中检索。",
  },
  en: {
    title: "Search",
    eyebrow: undefined as string | undefined,
    description: "Search the films, people, and lists on Babuban.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = parseLocale((await params).lang);
  const t = COPY[locale];
  return {
    title: t.title,
    description: t.description,
    // Indexable on purpose: the HTML is identical for every ?q (results
    // are island-only), and the canonical folds all variants onto the
    // bare page — which is also the SearchAction target.
    ...seoMetadata(locale, "/search", { en: true }),
  };
}

export default async function SearchPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = parseLocale((await params).lang);
  const t = COPY[locale];
  const labels = getDict(locale).search;

  return (
    <div className="mx-auto max-w-3xl animate-fade-up px-6 pt-16">
      <TitleCard eyebrow={t.eyebrow} title={t.title} />
      {/* The fallback is the empty-query shell — what prerenders into
          static HTML; the child reads ?q on hydration (films pattern). */}
      <Suspense fallback={<SearchPageBody locale={locale} labels={labels} initialQuery="" />}>
        <SearchPageWithParams locale={locale} labels={labels} />
      </Suspense>
    </div>
  );
}
