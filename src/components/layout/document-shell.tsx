// Fonts are self-hosted: Google Fonts' CDN is unreachable from mainland
// China, and next/font/google needs it at build time (ADR 0002). CJK is
// "Babuban Serif SC", Noto Serif SC subset to exactly what the site
// renders and bucketed by how many pages share each glyph (ADR 0018,
// `bun run fonts:generate`); the full Fontsource Noto Serif SC follows
// lazily as the fallback for newer characters. Source Serif 4 is the
// Latin body serif — the html:lang(en) override in globals.css switches
// --font-body, so its files only load on English pages even though the
// CSS ships everywhere.
import "@/assets/fonts/babuban-serif-sc.css";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/source-serif-4/400.css";
import "@fontsource/source-serif-4/700.css";
import "@/app/globals.css";
import { preload } from "react-dom";
import { ZH_FONT_PRELOADS } from "@/assets/fonts/preload";
import { FontFallback } from "./font-fallback";

/**
 * The single <html>/<body> skeleton, shared by both root layouts
 * (app/[lang] and app/admin) so the font posture (ADR 0002, 0018) lives
 * in one place. `preloadFonts` is for the zh public edition only: /en
 * needs a handful of CJK glyphs, and the admin sets its chrome in sans.
 */
export function DocumentShell({
  lang,
  preloadFonts = false,
  children,
}: Readonly<{
  lang: "zh-CN" | "en";
  preloadFonts?: boolean;
  children: React.ReactNode;
}>) {
  if (preloadFonts) {
    for (const href of ZH_FONT_PRELOADS) {
      preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
    }
  }
  return (
    <html lang={lang} className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <FontFallback />
        {children}
      </body>
    </html>
  );
}
