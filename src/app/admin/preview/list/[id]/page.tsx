import { notFound } from "next/navigation";
import { PreviewFrame } from "@/components/admin/preview-frame";
import { ListPage } from "@/components/list/list-page";
import { getListForPreview } from "@/db/queries/public";
import { requireEditor } from "@/lib/auth-guards";

export const metadata = { title: "预览片单" };

export default async function ListPreviewPage({
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
  const list = await getListForPreview(id);
  if (!list) notFound();

  return (
    <PreviewFrame locale={locale} editHref={`/admin/lists/${id}`}>
      <ListPage list={list} locale={locale} />
    </PreviewFrame>
  );
}
