import { LOCALES } from "@/i18n/locales";
import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Babuban — a curatorial handbook of classic cinema";
export const size = OG_SIZE;
export const contentType = "image/png";

// Prerendered per edition like the detail cards; without params of its
// own it rendered on every request.
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default function Image() {
  return ogCard({
    title: "A Curatorial Handbook of Classic Cinema",
    kicker: "Babuban · 8½",
  });
}
