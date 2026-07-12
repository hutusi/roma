import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Babuban — a curatorial handbook of classic cinema";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    title: "A Curatorial Handbook of Classic Cinema",
    kicker: "Babuban · 8½",
  });
}
