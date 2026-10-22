import type { Metadata, Viewport } from "next";
import { DocumentShell } from "@/components/layout/document-shell";
import { LangHintBanner } from "@/components/site/lang-hint-banner";
import { LazyToaster } from "@/components/site/lazy-toaster";
import { RumBeacon } from "@/components/site/rum-beacon";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getDict } from "@/i18n/dict";
import { HTML_LANG, isLocale, LOCALES, type Locale, localePath } from "@/i18n/locales";
import { SITE_URL } from "@/lib/site";

// Both locales prerender at build time. Deliberately NOT
// dynamicParams=false: that config cascades to every child segment,
// which would 404 newly published slugs until a redeploy and skip the
// styled catch-all 404. Invalid locales are rejected by the pages, each
// of which calls parseLocale(); the layout itself renders zh chrome for
// them (see chromeLocale) so that 404 has a frame to render in. No proxy
// or Accept-Language detection sits in the serving path (ADR 0012 keeps
// ADR 0005/0008's fully-static posture).
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const viewport: Viewport = { themeColor: "#faf8f4" };

const META: Record<Locale, Metadata> = {
  zh: {
    title: {
      default: "八部半 — 经典电影策展",
      template: "%s — 八部半",
    },
    description:
      "八部半（Babuban）是一份关于经典电影的中文策展手册：精选影片、导演谱系与精心编排的片单。",
  },
  en: {
    title: {
      default: "Babuban — Classic Cinema, Curated",
      template: "%s — Babuban",
    },
    description:
      "Babuban (八部半) is a curatorial handbook for classic cinema: curated films, director lineages, and lists worth watching in order.",
  },
};

const RSS_TITLE: Record<Locale, string> = { zh: "八部半", en: "Babuban" };

/**
 * Search-console ownership tokens, env-driven so each console can be
 * claimed without a code change (set the var in Vercel, redeploy —
 * they're baked into the SSG HTML). Bing and Baidu have no first-class
 * key in the Metadata type; `other` emits their <meta name> verbatim.
 */
function verification(): Metadata["verification"] {
  const other = {
    ...(process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : {}),
    ...(process.env.BAIDU_SITE_VERIFICATION
      ? { "baidu-site-verification": process.env.BAIDU_SITE_VERIFICATION }
      : {}),
  };
  return {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(Object.keys(other).length ? { other } : {}),
  };
}

/**
 * The layout never 404s itself: /foo matches [lang], and a notFound()
 * thrown here has no boundary above the root layout, so it came out as
 * Next's bare, unstyled 404. Rendering zh chrome lets the page's own
 * parseLocale() 404 land in [lang]/not-found.tsx like any other.
 */
const chromeLocale = (lang: string): Locale => (isLocale(lang) ? lang : "zh");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = chromeLocale((await params).lang);
  return { metadataBase: new URL(SITE_URL), verification: verification(), ...META[locale] };
}

export default async function LangRootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const locale = chromeLocale((await params).lang);
  return (
    <DocumentShell lang={HTML_LANG[locale]} preloadFonts={locale === "zh"}>
      {/* Hoisted to <head> by React; here (not layout metadata) so it survives
          pages that set their own `alternates`, e.g. the home page's hreflang. */}
      <link
        rel="alternate"
        type="application/rss+xml"
        title={RSS_TITLE[locale]}
        href={localePath(locale, "/rss.xml")}
      />
      {/* First focusable element: keyboard readers skip the header. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-paper focus:px-4 focus:py-2 focus:text-sm focus:ring-1 focus:ring-ink"
      >
        {getDict(locale).a11y.skipToContent}
      </a>
      <RumBeacon />
      <LangHintBanner locale={locale} />
      <SiteHeader locale={locale} />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <SiteFooter locale={locale} />
      <LazyToaster />
    </DocumentShell>
  );
}
