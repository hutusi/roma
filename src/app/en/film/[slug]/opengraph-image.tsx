import { notFound } from "next/navigation";
import { getPublishedFilmBySlug } from "@/db/queries/public";
import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Babuban film page";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const film = await getPublishedFilmBySlug(slug, "en");
  if (!film) notFound();
  return ogCard({
    title: film.titleEn ?? film.titleOriginal,
    subtitle: `${film.year}${film.isBlackAndWhite ? " · B&W" : ""}`,
    kicker: "The Films",
  });
}
