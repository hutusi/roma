import Link from "next/link";
import { notFound } from "next/navigation";
import { ListPage } from "@/components/list/list-page";
import { getListForPreview } from "@/db/queries/public";
import { requireEditor } from "@/lib/auth-guards";

export const metadata = { title: "预览片单" };

export default async function ListPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireEditor();
  const { id } = await params;
  const list = await getListForPreview(id);
  if (!list) notFound();

  return (
    <div>
      <p className="border-b border-line pb-3 text-sm text-ink-muted">
        草稿预览（读者视角，与公开页使用同一组件）·{" "}
        <Link href={`/admin/lists/${id}`} className="text-brand hover:underline">
          返回编辑
        </Link>
      </p>
      <ListPage list={list} />
    </div>
  );
}
