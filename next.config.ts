import type { NextConfig } from "next";

/** Permanent redirect from a launch-era root URL to its /zh home. */
const toZh = (source: string) => ({
  source,
  destination: `/zh${source}`,
  permanent: true,
});

const nextConfig: NextConfig = {
  // The zh site served these paths at the root before ADR 0012 moved
  // both locales to symmetric prefixes. Enumerated on purpose — a
  // catch-all regex funnel would run before the filesystem and silently
  // capture every future top-level route or metadata file. /en, /admin,
  // and /api are unchanged; true garbage gets Next's bare 404 until
  // global-not-found stabilizes.
  async redirects() {
    return [
      { source: "/", destination: "/zh", permanent: true },
      toZh("/films"),
      toZh("/lists"),
      toZh("/about"),
      toZh("/film/:slug"),
      toZh("/director/:slug"),
      toZh("/actor/:slug"),
      toZh("/list/:slug"),
      toZh("/sign-in"),
      toZh("/sign-up"),
      toZh("/forgot-password"),
      toZh("/reset-password"),
      toZh("/account"),
      toZh("/me/:path*"),
      toZh("/u/:path*"),
      toZh("/invite/:token"),
      toZh("/rss.xml"),
    ];
  },
  experimental: {
    serverActions: {
      // Image uploads go through a server action. App-level file cap is
      // 4MB; this stays above it (multipart overhead) but below
      // Vercel's 4.5MB request ceiling, so oversize uploads get a
      // friendly Next error instead of an opaque platform 413.
      bodySizeLimit: "4.4mb",
    },
  },
  images: {
    remotePatterns: [
      // Stills/posters live in Vercel Blob
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
