import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DirectorPage } from "@/components/director/director-page";
import { TranslationPending } from "@/components/i18n/translation-pending";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getDirectorStubBySlug,
  getPublishedDirectorBySlug,
  getPublishedDirectorSlugs,
} from "@/db/queries/public";
import { languageAlternates } from "@/i18n/alternates";
import { localePath } from "@/i18n/locales";
import { parseLocale } from "@/i18n/params";
import { directorJsonLd } from "@/lib/structured-data";

// zh slug set for both locales — en-pending directors prerender as
// translation-pending stubs (ADR 0012).
export async function generateStaticParams() {
  const slugs = await getPublishedDirectorSlugs();
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
  const en = locale === "en";
  if (!director) {
    if (en) {
      const stub = await getDirectorStubBySlug(slug);
      if (stub) return { title: stub.name, robots: { index: false } };
    }
    return {};
  }
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
  if (!director) {
    if (locale === "en") {
      const stub = await getDirectorStubBySlug(slug);
      if (stub) {
        return (
          <TranslationPending title={stub.name} zhHref={localePath("zh", `/director/${slug}`)} />
        );
      }
    }
    notFound();
  }
  return (
    <>
      <JsonLd data={directorJsonLd(director, locale)} />
      <DirectorPage director={director} locale={locale} />
    </>
  );
}
