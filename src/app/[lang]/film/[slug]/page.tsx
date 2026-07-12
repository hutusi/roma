import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FilmPage } from "@/components/film/film-page";
import { TranslationPending } from "@/components/i18n/translation-pending";
import { JsonLd } from "@/components/seo/json-ld";
import { MarkButtons } from "@/components/site/mark-buttons";
import {
  getFilmStubBySlug,
  getPublishedFilmBySlug,
  getPublishedFilmSlugs,
} from "@/db/queries/public";
import { languageAlternates } from "@/i18n/alternates";
import { getDict } from "@/i18n/dict";
import { localePath } from "@/i18n/locales";
import { parseLocale } from "@/i18n/params";
import { filmJsonLd } from "@/lib/structured-data";

// The zh slug set for BOTH locales: en-pending entities prerender as
// translation-pending stubs on /en (ADR 0012), and publishFilmEn flips
// a stub to the full page through revalidate.ts with no redeploy.
export async function generateStaticParams() {
  const slugs = await getPublishedFilmSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = parseLocale(lang);
  const film = await getPublishedFilmBySlug(slug, locale);
  const en = locale === "en";
  if (!film) {
    if (en) {
      const stub = await getFilmStubBySlug(slug);
      // Stubs are thin content: noindex, and no hreflang advertising
      // (the zh page already declines the en alternate while unpublished).
      if (stub) {
        return {
          title: `${stub.titleEn ?? stub.titleOriginal} (${stub.year})`,
          robots: { index: false },
        };
      }
    }
    return {};
  }
  return {
    title: en
      ? `${film.titleEn ?? film.titleOriginal} (${film.year})`
      : `${film.titleZh}（${film.year}）`,
    description: en
      ? (film.editorialNoteEn?.slice(0, 160) ?? film.titleOriginal)
      : (film.editorialNote?.slice(0, 120) ?? film.titleOriginal),
    alternates: {
      languages: languageAlternates(`/film/${slug}`, {
        en: en || film.statusEn === "published",
      }),
    },
  };
}

export default async function PublicFilmPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale = parseLocale(lang);
  const film = await getPublishedFilmBySlug(slug, locale);
  if (!film) {
    if (locale === "en") {
      // zh-published but en-pending: the first query only misses for en
      // when statusEn isn't published, so a stub hit means exactly that.
      const stub = await getFilmStubBySlug(slug);
      if (stub) {
        return (
          <TranslationPending
            title={stub.titleEn ?? stub.titleOriginal}
            subtitle={stub.titleEn ? stub.titleOriginal : null}
            year={stub.year}
            zhHref={localePath("zh", `/film/${slug}`)}
          />
        );
      }
    }
    notFound();
  }
  return (
    <>
      <JsonLd data={filmJsonLd(film, locale)} />
      <FilmPage
        film={film}
        locale={locale}
        actions={
          <MarkButtons
            filmId={film.id}
            labels={getDict(locale).markButtons}
            signInHref={localePath(locale, "/sign-in")}
          />
        }
      />
    </>
  );
}
