import { notFound } from "next/navigation";
import { getPublishedDirectorBySlug } from "@/db/queries/public";
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
  const director = await getPublishedDirectorBySlug(slug, parseLocale(lang));
  if (!director) notFound();
  // ogCard renders the title in Playfair (Latin), so use the romanized name.
  return ogCard({ title: director.name, kicker: "The Directors" });
}
