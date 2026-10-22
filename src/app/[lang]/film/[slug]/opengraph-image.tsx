import { notFound } from "next/navigation";
import { getFilmStubBySlug, getPublishedFilmSlugs } from "@/db/queries/public";
import { parseLocale } from "@/i18n/params";
import { everyLocale, OG_SIZE, ogCard } from "@/lib/og";

// A static alt can't vary by lang, so it stays a Latin brand string on
// both locales (invisible metadata; ADR 0012 accepts this).
export const alt = "Babuban film page";
export const size = OG_SIZE;
export const contentType = "image/png";

// Prerendered with the page: without params of its own the card rendered
// on every request (Next serves ImageResponse with max-age=0), running a
// query per crawler hit.
export async function generateStaticParams() {
  return everyLocale(await getPublishedFilmSlugs());
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale = parseLocale(lang);
  // zh visibility: en-pending entities render stubs, and a stub page's
  // auto-referenced og:image must resolve too (ADR 0012).
  // The slim stub row, not the detail query: a card needs four columns.
  const film = await getFilmStubBySlug(slug);
  if (!film) notFound();
  return ogCard({
    title: locale === "en" ? (film.titleEn ?? film.titleOriginal) : film.titleOriginal,
    subtitle: `${film.year}${film.isBlackAndWhite ? " · B&W" : ""}`,
    kicker: "The Films",
  });
}
