import type { Metadata } from "next";
import { RumBeacon } from "@/components/site/rum-beacon";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SITE_URL } from "@/lib/site";

// Same self-hosted posture as the zh tree (Google Fonts is unreachable
// from mainland China), plus a Latin text serif: Playfair is display
// type, and Noto Serif SC's Latin glyphs read CJK-flavored. The
// html:lang(en) override in globals.css switches --font-body.
import "@fontsource/noto-serif-sc/400.css";
import "@fontsource/noto-serif-sc/700.css";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/source-serif-4/400.css";
import "@fontsource/source-serif-4/700.css";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Babuban — Classic Cinema, Curated",
    template: "%s — Babuban",
  },
  description:
    "Babuban (八部半) is a curatorial handbook for classic cinema: black-and-white films, director lineages, and lists worth watching in order.",
};

/**
 * Root layout for the English edition. /en is a second root-layout tree
 * (not a [lang] segment) so the launched zh URLs stay at the root and
 * no proxy sits in the editorial serving path. /en only ever holds site
 * pages, so the chrome lives here rather than in a nested layout.
 */
export default function EnRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <RumBeacon />
        <SiteHeader locale="en" />
        <main className="flex-1">{children}</main>
        <SiteFooter locale="en" />
      </body>
    </html>
  );
}
