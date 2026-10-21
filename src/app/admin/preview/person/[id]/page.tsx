import { notFound } from "next/navigation";
import { PreviewFrame } from "@/components/admin/preview-frame";
import { PersonPage } from "@/components/person/person-page";
import { getPersonForPreview } from "@/db/queries/public";
import { requireEditor } from "@/lib/auth-guards";

export const metadata = { title: "预览人物" };

export default async function PersonPreviewPage({
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
  // Locale must reach normalization too, or the en preview keeps films
  // the published /en page hides.
  const person = await getPersonForPreview(id, locale);
  if (!person) notFound();

  return (
    <PreviewFrame locale={locale} editHref={`/admin/people/${id}`}>
      <PersonPage person={person} locale={locale} />
    </PreviewFrame>
  );
}
