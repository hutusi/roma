import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TranslationPending } from "@/components/i18n/translation-pending";
import { PersonPage } from "@/components/person/person-page";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getPersonStubBySlug,
  getPublishedPersonBySlug,
  getPublishedPersonSlugs,
} from "@/db/queries/public";
import { localePath } from "@/i18n/locales";
import { parseLocale } from "@/i18n/params";
import { seoMetadata } from "@/lib/seo";
import { personJsonLd } from "@/lib/structured-data";

// zh slug set for both locales — en-pending people prerender as
// translation-pending stubs (ADR 0012).
export async function generateStaticParams() {
  const slugs = await getPublishedPersonSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = parseLocale(lang);
  const person = await getPublishedPersonBySlug(slug, locale);
  const en = locale === "en";
  if (!person) {
    if (en) {
      const stub = await getPersonStubBySlug(slug);
      if (stub) return { title: stub.name, robots: { index: false } };
    }
    return {};
  }
  return {
    title: en ? person.name : (person.nameZh ?? person.name),
    description: en
      ? (person.bioEn?.slice(0, 160) ?? person.name)
      : (person.bio?.slice(0, 120) ?? person.name),
    ...seoMetadata(locale, `/director/${slug}`, {
      en: en || person.statusEn === "published",
      ogType: "profile",
    }),
  };
}

export default async function PublicDirectorPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale = parseLocale(lang);
  const person = await getPublishedPersonBySlug(slug, locale);
  if (!person) {
    if (locale === "en") {
      const stub = await getPersonStubBySlug(slug);
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
      <JsonLd data={personJsonLd(person, locale)} />
      <PersonPage person={person} locale={locale} />
    </>
  );
}
