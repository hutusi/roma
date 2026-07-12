import type { Metadata } from "next";
import { DocumentShell } from "@/components/layout/document-shell";
import { RumBeacon } from "@/components/site/rum-beacon";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { HTML_LANG, type Locale } from "@/i18n/locales";
import { parseLocale } from "@/i18n/params";
import { SITE_URL } from "@/lib/site";

// Both locales prerender at build time. Deliberately NOT
// dynamicParams=false: that config cascades to every child segment,
// which would 404 newly published slugs until a redeploy and skip the
// styled catch-all 404. Invalid locales are rejected at render time by
// parseLocale() below instead. No proxy or Accept-Language detection
// sits in the serving path (ADR 0012 keeps ADR 0005/0008's
// fully-static posture).
// TODO(en-merge): return LOCALES.map once app/en is folded in — while
// that tree still exists it owns the /en URLs.
export function generateStaticParams() {
  return [{ lang: "zh" }];
}

const META: Record<Locale, Metadata> = {
  zh: {
    title: {
      default: "八部半 — 经典电影策展",
      template: "%s — 八部半",
    },
    description:
      "八部半（Babuban）是一份关于经典电影的中文策展手册：黑白影片、导演谱系与精心编排的片单。",
  },
  en: {
    title: {
      default: "Babuban — Classic Cinema, Curated",
      template: "%s — Babuban",
    },
    description:
      "Babuban (八部半) is a curatorial handbook for classic cinema: black-and-white films, director lineages, and lists worth watching in order.",
  },
};

const RSS_TITLE: Record<Locale, string> = { zh: "八部半", en: "Babuban" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = parseLocale((await params).lang);
  return { metadataBase: new URL(SITE_URL), ...META[locale] };
}

export default async function LangRootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const locale = parseLocale((await params).lang);
  return (
    <DocumentShell lang={HTML_LANG[locale]}>
      {/* Hoisted to <head> by React; here (not layout metadata) so it survives
          pages that set their own `alternates`, e.g. the home page's hreflang. */}
      <link
        rel="alternate"
        type="application/rss+xml"
        title={RSS_TITLE[locale]}
        href={`/${locale}/rss.xml`}
      />
      <RumBeacon />
      <SiteHeader locale={locale} />
      <main className="flex-1">{children}</main>
      <SiteFooter locale={locale} />
    </DocumentShell>
  );
}
