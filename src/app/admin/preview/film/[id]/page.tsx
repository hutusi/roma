import { notFound } from "next/navigation";
import { PreviewFrame } from "@/components/admin/preview-frame";
import { FilmPage } from "@/components/film/film-page";
import { getFilmForPreview } from "@/db/queries/public";
import { requireEditor } from "@/lib/auth-guards";

export const metadata = { title: "预览影片" };

export default async function FilmPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ locale?: string }>;
}) {
  await requireEditor();
  const { id } = await params;
  const { locale: localeParam } = await searchParams;
  const locale = localeParam === "en" ? "en" : "zh";
  // Locale must reach normalization too, or the en preview keeps related
  // lists the published /en page hides.
  const film = await getFilmForPreview(id, locale);
  if (!film) notFound();

  return (
    <PreviewFrame locale={locale} editHref={`/admin/films/${id}`}>
      <FilmPage film={film} locale={locale} />
    </PreviewFrame>
  );
}
