import { notFound } from "next/navigation";
import { getPublishedFilmBySlug } from "@/db/queries/public";
import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "八部半影片页";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const film = await getPublishedFilmBySlug(slug);
  if (!film) notFound();
  return ogCard({
    title: film.titleOriginal,
    subtitle: `${film.year}${film.isBlackAndWhite ? " · B&W" : ""}`,
    kicker: "The Films",
  });
}
