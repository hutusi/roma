import { notFound } from "next/navigation";
import { getPublishedListBySlug } from "@/db/queries/public";
import { parseLocale } from "@/i18n/params";
import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Babuban curated list";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const list = await getPublishedListBySlug(slug, parseLocale(lang));
  if (!list) notFound();
  return ogCard({
    title: "A Curated List",
    subtitle: `${list.items.length} FILMS`,
    kicker: "Curated Lists",
  });
}
