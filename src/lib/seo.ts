import "server-only";
import type { Metadata } from "next";
import { languageAlternates } from "@/i18n/alternates";
import { type Locale, localePath } from "@/i18n/locales";

const SITE_NAME = { zh: "八部半", en: "Babuban" } as const;
const OG_LOCALE = { zh: "zh_CN", en: "en_US" } as const;

type OgType = "website" | "video.movie" | "profile";

/**
 * Canonical + hreflang + og/twitter identity for an indexable page.
 * Paths are relative — metadataBase (set in the root layouts) composes
 * them into absolute URLs, matching languageAlternates' convention.
 *
 * Deliberately sets NO title/description/images: Next's resolver
 * inherits og/twitter title+description from the page's own metadata
 * (with the layout's template applied) and merges the file-convention
 * opengraph-image into og:image → twitter:image. An `images` key here
 * — even an empty one — would suppress that merge.
 */
export function seoMetadata(
  locale: Locale,
  path: string,
  opts: { en: boolean; ogType?: OgType },
): Pick<Metadata, "alternates" | "openGraph" | "twitter"> {
  return {
    alternates: {
      canonical: localePath(locale, path),
      languages: languageAlternates(path, { en: opts.en }),
    },
    openGraph: {
      type: opts.ogType ?? "website",
      siteName: SITE_NAME[locale],
      locale: OG_LOCALE[locale],
      url: localePath(locale, path),
    },
    twitter: { card: "summary_large_image" },
  };
}
