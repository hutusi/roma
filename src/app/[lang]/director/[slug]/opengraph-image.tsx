import { notFound } from "next/navigation";
import { getPublishedPersonBySlug } from "@/db/queries/public";
import { parseLocale } from "@/i18n/params";
import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Babuban director page";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  parseLocale(lang);
  // zh visibility — see the film OG card (stub pages need a card too).
  const person = await getPublishedPersonBySlug(slug);
  if (!person) notFound();
  // ogCard renders the title in Playfair (Latin), so use the romanized name.
  return ogCard({ title: person.name, kicker: "The Directors" });
}
