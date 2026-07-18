import "server-only";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
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
import { type PersonUrlRole, personPath } from "@/lib/routes";
import { seoMetadata } from "@/lib/seo";
import { personJsonLd } from "@/lib/structured-data";

/**
 * Shared logic for the two person segments (/director, /actor). Each
 * person has ONE canonical URL, picked by primaryRole; the resolution
 * order is load-bearing: the canonical check runs BEFORE the en-pending
 * stub, so a stub only ever renders at its canonical segment and the
 * other segment 308s — otherwise /en would expose the same noindex stub
 * at two URLs.
 */

type Params = Promise<{ lang: string; slug: string }>;

/** zh slug set for both locales — en-pending people prerender as stubs (ADR 0012). */
export async function personStaticParams(role: PersonUrlRole) {
  const slugs = await getPublishedPersonSlugs("zh", role);
  return slugs.map(({ slug }) => ({ slug }));
}

export async function personPageMetadata(role: PersonUrlRole, params: Params): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = parseLocale(lang);
  const person = await getPublishedPersonBySlug(slug, locale);
  const en = locale === "en";
  if (!person) {
    if (en) {
      const stub = await getPersonStubBySlug(slug);
      // Non-canonical segment: the page 308s, so emit no metadata at all.
      if (stub && stub.primaryRole === role) return { title: stub.name, robots: { index: false } };
    }
    return {};
  }
  if (person.primaryRole !== role) return {};
  return {
    title: en ? person.name : (person.nameZh ?? person.name),
    description: en
      ? (person.bioEn?.slice(0, 160) ?? person.name)
      : (person.bio?.slice(0, 120) ?? person.name),
    ...seoMetadata(locale, personPath(person), {
      en: en || person.statusEn === "published",
      ogType: "profile",
    }),
  };
}

export async function renderPersonPage(role: PersonUrlRole, params: Params) {
  const { lang, slug } = await params;
  const locale = parseLocale(lang);
  const person = await getPublishedPersonBySlug(slug, locale);
  if (person) {
    if (person.primaryRole !== role) {
      permanentRedirect(localePath(locale, personPath(person)));
    }
    return (
      <>
        <JsonLd data={personJsonLd(person, locale)} />
        <PersonPage person={person} locale={locale} />
      </>
    );
  }
  if (locale === "en") {
    const stub = await getPersonStubBySlug(slug);
    if (stub) {
      if (stub.primaryRole !== role) {
        permanentRedirect(localePath("en", personPath(stub)));
      }
      return <TranslationPending title={stub.name} zhHref={localePath("zh", personPath(stub))} />;
    }
  }
  notFound();
}
