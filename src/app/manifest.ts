import type { MetadataRoute } from "next";

// Icons carry `purpose: "any"` only — a maskable variant would need the
// mark regenerated with a safe-zone inset (the hairline frame would be
// cropped by the platform mask); revisit if an installable PWA matters.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "八部半 · Babuban",
    short_name: "八部半",
    description: "关于经典电影的策展手册：黑白影片、导演谱系与片单。",
    start_url: "/zh",
    display: "minimal-ui",
    background_color: "#faf8f4",
    theme_color: "#faf8f4",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
