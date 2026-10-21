import { asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  deletePerson,
  publishPerson,
  publishPersonEn,
  unpublishPerson,
  unpublishPersonEn,
} from "@/actions/people";
import { EditorLinks } from "@/components/admin/editor-links";
import { PublishReadiness } from "@/components/admin/publish-readiness";
import { db } from "@/db";
import { films, media, people } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { personPath } from "@/lib/routes";
import { publishEnProblems, publishProblems } from "@/lib/validators/person";
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
  // The publish gates, run on the saved row exactly as the actions run them.
  const problems = publishProblems({ bio: person.bio, editorialNote: person.editorialNote });
  const problemsEn = publishEnProblems({
    bioEn: person.bioEn,
    editorialNoteEn: person.editorialNoteEn,
  });

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
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 space-y-1">
          <h1 className="font-bold text-xl">编辑人物 · {person.nameZh ?? person.name}</h1>
          <EditorLinks
            previewHref={`/admin/preview/person/${person.id}`}
            publicPath={personPath(person)}
            published={person.status === "published"}
            publishedEn={person.statusEn === "published"}
          />
        </div>
        <div className="flex items-center gap-6">
          <PublishControls
            status={person.status}
            onPublish={publishPerson.bind(null, person.id)}
            problems={problems}
            onUnpublish={unpublishPerson.bind(null, person.id)}
            onDelete={deletePerson.bind(null, person.id)}
            deleteConfirmText={`确定删除「${person.nameZh ?? person.name}」？该操作不可撤销。`}
            afterDeleteHref="/admin/people"
          />
          <PublishControls
            status={person.statusEn}
            label="英文版"
            onPublish={publishPersonEn.bind(null, person.id)}
            problems={problemsEn}
            onUnpublish={unpublishPersonEn.bind(null, person.id)}
          />
        </div>
      </div>
      <PublishReadiness
        editions={[
          { label: "中文版", published: person.status === "published", problems },
          { label: "英文版", published: person.statusEn === "published", problems: problemsEn },
        ]}
      />
      <div className="mt-6">
        <PersonForm
          personId={person.id}
          revision={person.revision}
          media={mediaRows}
          defaultValues={{
            slug: person.slug,
            name: person.name,
            nameZh: person.nameZh ?? "",
            primaryRole: person.primaryRole,
            bio: person.bio ?? "",
            careerEssay: person.careerEssay ?? null,
            bioEn: person.bioEn ?? "",
            careerEssayEn: person.careerEssayEn ?? null,
            editorialNote: person.editorialNote ?? "",
            editorialNoteEn: person.editorialNoteEn ?? "",
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
