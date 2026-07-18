import { asc, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deletePerson,
  publishPerson,
  publishPersonEn,
  unpublishPerson,
  unpublishPersonEn,
} from "@/actions/people";
import { db } from "@/db";
import { films, media, people } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { PublishControls } from "../../films/publish-controls";
import { PersonForm } from "../person-form";
import { ViewingOrderPanel } from "../viewing-order-panel";

export const metadata = { title: "编辑人物" };

export default async function EditPersonPage({ params }: { params: Promise<{ id: string }> }) {
  await requireEditor();
  const { id } = await params;
  const person = await db.query.people.findFirst({
    where: eq(people.id, id),
  });
  if (!person) notFound();

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
        <h1 className="font-bold text-xl">
          编辑人物 · {person.nameZh ?? person.name}
          <Link
            href={`/admin/preview/person/${person.id}`}
            className="ml-3 font-normal text-brand text-sm hover:underline"
          >
            预览
          </Link>
          <Link
            href={`/admin/preview/person/${person.id}?locale=en`}
            className="ml-2 font-normal text-brand text-sm hover:underline"
          >
            EN 预览
          </Link>
        </h1>
        <div className="flex items-center gap-6">
          <PublishControls
            status={person.status}
            onPublish={publishPerson.bind(null, person.id)}
            onUnpublish={unpublishPerson.bind(null, person.id)}
            onDelete={deletePerson.bind(null, person.id)}
            deleteConfirmText={`确定删除「${person.nameZh ?? person.name}」？该操作不可撤销。`}
            afterDeleteHref="/admin/people"
          />
          <PublishControls
            status={person.statusEn}
            label="英文版"
            onPublish={publishPersonEn.bind(null, person.id)}
            onUnpublish={unpublishPersonEn.bind(null, person.id)}
          />
        </div>
      </div>
      <div className="mt-6">
        <PersonForm
          personId={person.id}
          media={mediaRows}
          defaultValues={{
            slug: person.slug,
            name: person.name,
            nameZh: person.nameZh ?? "",
            bio: person.bio ?? "",
            careerEssay: person.careerEssay ?? null,
            bioEn: person.bioEn ?? "",
            careerEssayEn: person.careerEssayEn ?? null,
          }}
        />
      </div>
      <ViewingOrderPanel
        personId={person.id}
        filmOptions={filmRows}
        initialItems={viewingItems.map((item) => ({
          id: item.film.id,
          filmId: item.film.id,
          title: item.film.titleZh,
          year: item.film.year,
          note: item.note ?? "",
          noteEn: item.noteEn ?? "",
        }))}
      />
    </div>
  );
}
