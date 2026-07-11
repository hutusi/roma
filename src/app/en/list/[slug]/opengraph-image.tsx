import { notFound } from "next/navigation";
import { getPublishedListBySlug } from "@/db/queries/public";
import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Babuban curated list";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const list = await getPublishedListBySlug(slug, "en");
  if (!list) notFound();
  return ogCard({
    title: "A Curated List",
    subtitle: `${list.items.length} FILMS`,
    kicker: "Curated Lists",
  });
}
