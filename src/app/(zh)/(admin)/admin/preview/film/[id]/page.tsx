import Link from "next/link";
import { notFound } from "next/navigation";
import { FilmPage } from "@/components/film/film-page";
import { getFilmForPreview } from "@/db/queries/public";
import { requireEditor } from "@/lib/auth-guards";

export const metadata = { title: "预览影片" };

export default async function FilmPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireEditor();
  const { id } = await params;
  const film = await getFilmForPreview(id);
  if (!film) notFound();

  return (
    <div>
      <p className="border-line border-b pb-3 text-ink-muted text-sm">
        草稿预览（读者视角，与公开页使用同一组件）·{" "}
        <Link href={`/admin/films/${id}`} className="text-brand hover:underline">
          返回编辑
        </Link>
      </p>
      <FilmPage film={film} />
    </div>
  );
}
