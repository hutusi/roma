import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { curatedLists, films, media } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { deleteList, publishList, unpublishList } from "@/actions/lists";
import { PublishControls } from "../../films/publish-controls";
import { ItemsPanel } from "../items-panel";
import { ListForm } from "../list-form";

export const metadata = { title: "编辑片单" };

export default async function EditListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
    db
      .select({ id: media.id, url: media.url, alt: media.alt })
      .from(media)
      .orderBy(desc(media.createdAt))
      .limit(200),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          编辑片单 · {list.title}
          <Link
            href={`/admin/preview/list/${list.id}`}
            className="ml-3 text-sm font-normal text-brand hover:underline"
          >
            预览
          </Link>
        </h1>
        <PublishControls
          status={list.status}
          onPublish={publishList.bind(null, list.id)}
          onUnpublish={unpublishList.bind(null, list.id)}
          onDelete={deleteList.bind(null, list.id)}
          deleteConfirmText={`确定删除片单「${list.title}」？该操作不可撤销。`}
          afterDeleteHref="/admin/lists"
        />
      </div>
      <div className="mt-6">
        <ListForm
          listId={list.id}
          media={mediaRows}
          defaultValues={{
            slug: list.slug,
            title: list.title,
            theme: list.theme ?? "",
            intro: list.intro ?? null,
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
        }))}
      />
    </div>
  );
}
