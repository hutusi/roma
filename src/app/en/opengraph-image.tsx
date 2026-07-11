import { OG_SIZE, ogCard } from "@/lib/og";

// The /en tree's default OG card. Without this, /en and /en/about would
// inherit the root card, whose `alt` is Chinese — a zh string on /en.
// The per-entity /en/film and /en/list routes keep their own cards.
export const alt = "Babuban — a curatorial handbook of classic cinema";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    title: "A Curatorial Handbook of Classic Cinema",
    kicker: "Babuban · 8½",
  });
}
