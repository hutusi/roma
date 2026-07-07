import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
