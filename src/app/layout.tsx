import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

// Fonts are self-hosted via Fontsource: Google Fonts' CDN is unreachable
// from mainland China, and next/font/google needs it at build time. The
// Noto Serif SC CSS carries ~100 unicode-range slices per weight, so
// browsers fetch only the few slices a page actually uses.
import "@fontsource/noto-serif-sc/400.css";
import "@fontsource/noto-serif-sc/700.css";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/700.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "八部半 — 经典电影策展",
    template: "%s — 八部半",
  },
  description:
    "八部半（Babuban）是一份关于经典电影的中文策展手册：黑白影片、导演谱系与精心编排的片单。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
