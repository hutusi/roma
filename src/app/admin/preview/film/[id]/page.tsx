import Link from "next/link";
import { notFound } from "next/navigation";
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
  const film = await getFilmForPreview(id);
  if (!film) notFound();

  return (
    <div>
      <p className="border-line border-b pb-3 text-ink-muted text-sm">
        草稿预览（读者视角，与公开页使用同一组件）
        {locale === "en" && " · 英文版"} ·{" "}
        <Link href={`/admin/films/${id}`} className="text-brand hover:underline">
          返回编辑
        </Link>
      </p>
      <FilmPage film={film} locale={locale} />
    </div>
  );
}
