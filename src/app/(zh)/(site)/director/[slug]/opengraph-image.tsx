import { notFound } from "next/navigation";
import { getPublishedDirectorBySlug } from "@/db/queries/public";
import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "八部半导演页";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const director = await getPublishedDirectorBySlug(slug);
  if (!director) notFound();
  // ogCard renders the title in Playfair (Latin), so use the romanized name.
  return ogCard({ title: director.name, kicker: "The Directors" });
}
