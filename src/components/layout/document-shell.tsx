// Fonts are self-hosted via Fontsource: Google Fonts' CDN is unreachable
// from mainland China, and next/font/google needs it at build time. The
// Noto Serif SC CSS carries ~100 unicode-range slices per weight, so
// browsers fetch only the few slices a page actually uses. Source Serif 4
// is the Latin body serif — the html:lang(en) override in globals.css
// switches --font-body, so its files only load on English pages even
// though the CSS ships everywhere.
import "@fontsource/noto-serif-sc/400.css";
import "@fontsource/noto-serif-sc/700.css";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/source-serif-4/400.css";
import "@fontsource/source-serif-4/700.css";
import "@/app/globals.css";

/**
 * The single <html>/<body> skeleton, shared by both root layouts
 * (app/[lang] and app/admin) so the font posture (ADR 0002) lives in
 * one place.
 */
export function DocumentShell({
  lang,
  children,
}: Readonly<{
  lang: "zh-CN" | "en";
  children: React.ReactNode;
}>) {
  return (
    <html lang={lang} className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
