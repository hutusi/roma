import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { directors, films, media } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import {
  deleteDirector,
  publishDirector,
  unpublishDirector,
} from "@/actions/directors";
import { PublishControls } from "../../films/publish-controls";
import { DirectorForm } from "../director-form";
import { ViewingOrderPanel } from "../viewing-order-panel";

export const metadata = { title: "编辑导演" };

export default async function EditDirectorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireEditor();
  const { id } = await params;
  const director = await db.query.directors.findFirst({
    where: eq(directors.id, id),
  });
  if (!director) notFound();

  const [viewingItems, filmRows, mediaRows] = await Promise.all([
    db.query.directorViewingItems.findMany({
      where: (t, { eq }) => eq(t.directorId, id),
      orderBy: (t, { asc }) => asc(t.position),
      with: { film: { columns: { id: true, titleZh: true, year: true } } },
    }),
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
          编辑导演 · {director.nameZh ?? director.name}
          <Link
            href={`/admin/preview/director/${director.id}`}
            className="ml-3 text-sm font-normal text-brand hover:underline"
          >
            预览
          </Link>
        </h1>
        <PublishControls
          status={director.status}
          onPublish={publishDirector.bind(null, director.id)}
          onUnpublish={unpublishDirector.bind(null, director.id)}
          onDelete={deleteDirector.bind(null, director.id)}
          deleteConfirmText={`确定删除「${director.nameZh ?? director.name}」？该操作不可撤销。`}
          afterDeleteHref="/admin/directors"
        />
      </div>
      <div className="mt-6">
        <DirectorForm
          directorId={director.id}
          media={mediaRows}
          defaultValues={{
            slug: director.slug,
            name: director.name,
            nameZh: director.nameZh ?? "",
            bio: director.bio ?? "",
            careerEssay: director.careerEssay ?? null,
          }}
        />
      </div>
      <ViewingOrderPanel
        directorId={director.id}
        filmOptions={filmRows}
        initialItems={viewingItems.map((item) => ({
          id: item.film.id,
          filmId: item.film.id,
          title: item.film.titleZh,
          year: item.film.year,
          note: item.note ?? "",
        }))}
      />
    </div>
  );
}
