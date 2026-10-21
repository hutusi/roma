import { notFound } from "next/navigation";
import { getPublishedListFilmCount, getPublishedListSlugs } from "@/db/queries/public";
import { parseLocale } from "@/i18n/params";
import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Babuban curated list";
export const size = OG_SIZE;
export const contentType = "image/png";

// Prerendered with the page (see the film card).
export async function generateStaticParams() {
  const slugs = await getPublishedListSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  parseLocale(lang);
  // zh visibility — see the film OG card (stub pages need a card too).
  const films = await getPublishedListFilmCount(slug);
  if (films === null) notFound();
  return ogCard({
    title: "A Curated List",
    subtitle: `${films} ${films === 1 ? "FILM" : "FILMS"}`,
    kicker: "Curated Lists",
  });
}
