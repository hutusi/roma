import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "八部半 — 经典电影策展";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    title: "A Curatorial Handbook of Classic Cinema",
    kicker: "Babuban · 8½",
  });
}
