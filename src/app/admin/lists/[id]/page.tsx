import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  deleteList,
  publishList,
  publishListEn,
  unpublishList,
  unpublishListEn,
} from "@/actions/lists";
import { EditorLinks } from "@/components/admin/editor-links";
import { db } from "@/db";
import { getEditorMedia } from "@/db/queries/admin";
import { curatedLists, films } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { PublishControls } from "../../films/publish-controls";
import { ItemsPanel } from "../items-panel";
import { ListForm } from "../list-form";

export const metadata = { title: "编辑片单" };

export default async function EditListPage({ params }: { params: Promise<{ id: string }> }) {
  await requireEditor();
  const { id } = await params;
  const list = await db.query.curatedLists.findFirst({
    where: eq(curatedLists.id, id),
    with: {
      items: {
        orderBy: (t, { asc }) => asc(t.position),
        with: { film: { columns: { id: true, titleZh: true, year: true } } },
      },
    },
  });
  if (!list) notFound();

  const [filmRows, mediaRows] = await Promise.all([
    db
      .select({ id: films.id, title: films.titleZh, year: films.year })
      .from(films)
      .orderBy(asc(films.year)),
    getEditorMedia(),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 space-y-1">
          <h1 className="font-bold text-xl">编辑片单 · {list.title}</h1>
          <EditorLinks
            previewHref={`/admin/preview/list/${list.id}`}
            publicPath={`/list/${list.slug}`}
            published={list.status === "published"}
            publishedEn={list.statusEn === "published"}
          />
        </div>
        <div className="flex items-center gap-6">
          <PublishControls
            status={list.status}
            onPublish={publishList.bind(null, list.id)}
            onUnpublish={unpublishList.bind(null, list.id)}
            onDelete={deleteList.bind(null, list.id)}
            deleteConfirmText={`确定删除片单「${list.title}」？该操作不可撤销。`}
            afterDeleteHref="/admin/lists"
          />
          <PublishControls
            status={list.statusEn}
            label="英文版"
            onPublish={publishListEn.bind(null, list.id)}
            onUnpublish={unpublishListEn.bind(null, list.id)}
          />
        </div>
      </div>
      <div className="mt-6">
        <ListForm
          listId={list.id}
          revision={list.revision}
          media={mediaRows}
          defaultValues={{
            slug: list.slug,
            title: list.title,
            theme: list.theme ?? "",
            intro: list.intro ?? null,
            titleEn: list.titleEn ?? "",
            themeEn: list.themeEn ?? "",
            introEn: list.introEn ?? null,
            sortOrder: list.sortOrder,
          }}
        />
      </div>
      <ItemsPanel
        listId={list.id}
        filmOptions={filmRows}
        initialItems={list.items.map((item) => ({
          id: item.id,
          filmId: item.film.id,
          title: item.film.titleZh,
          year: item.film.year,
          reasoning: item.reasoning ?? null,
          reasoningEn: item.reasoningEn ?? null,
        }))}
      />
    </div>
  );
}
