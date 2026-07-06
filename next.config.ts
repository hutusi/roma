import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Image uploads go through a server action; the app-level cap is
      // 4MB (Vercel's request ceiling is 4.5MB).
      bodySizeLimit: "5mb",
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
