import { asc, eq } from "drizzle-orm";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  deleteFilm,
  publishFilm,
  publishFilmEn,
  unpublishFilm,
  unpublishFilmEn,
} from "@/actions/films";
import { GuardedLink } from "@/components/admin/dirty-guard";
import { EditorLinks } from "@/components/admin/editor-links";
import { PublishReadiness } from "@/components/admin/publish-readiness";
import { db } from "@/db";
import { getEditorMedia } from "@/db/queries/admin";
import { films, people, tags } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { publishEnProblems, publishProblems } from "@/lib/validators/film";
import { FilmForm } from "../film-form";
import { PublishControls } from "../publish-controls";

export const metadata = { title: "编辑影片" };

export default async function EditFilmPage({ params }: { params: Promise<{ id: string }> }) {
  await requireEditor();
  const { id } = await params;
  const film = await db.query.films.findFirst({
    where: eq(films.id, id),
    with: {
      filmDirectors: true,
      filmTags: true,
      cast: { orderBy: (t, { asc }) => asc(t.position) },
      watchLinks: { orderBy: (t, { asc }) => asc(t.sortOrder) },
      media: { orderBy: (t, { asc }) => asc(t.sortOrder) },
    },
  });
  if (!film) notFound();
  // The publish gates, run on the saved row exactly as the actions run them.
  const problems = publishProblems({
    introduction: film.introduction,
    editorialNote: film.editorialNote,
    directorCount: film.filmDirectors.length,
  });
  const problemsEn = publishEnProblems({
    titleEn: film.titleEn,
    introductionEn: film.introductionEn,
    editorialNoteEn: film.editorialNoteEn,
  });

  const [personRows, tagRows, mediaRows] = await Promise.all([
    db
      .select({
        id: people.id,
        name: people.name,
        nameZh: people.nameZh,
        primaryRole: people.primaryRole,
      })
      .from(people)
      .orderBy(asc(people.name)),
    db.select({ id: tags.id, nameZh: tags.nameZh }).from(tags).orderBy(asc(tags.slug)),
    getEditorMedia(),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 space-y-1">
          <h1 className="font-bold text-xl">编辑影片 · {film.titleZh}</h1>
          <EditorLinks
            previewHref={`/admin/preview/film/${film.id}`}
            publicPath={`/film/${film.slug}`}
            published={film.status === "published"}
            publishedEn={film.statusEn === "published"}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <PublishControls
            status={film.status}
            onPublish={publishFilm.bind(null, film.id)}
            problems={problems}
            onUnpublish={unpublishFilm.bind(null, film.id)}
            onDelete={deleteFilm.bind(null, film.id)}
            deleteConfirmText={`《${film.titleZh}》将被永久删除，不可恢复。已发布的影片需先撤回。`}
            unpublishConfirmText="撤回后读者将无法访问这部影片。若某份片单因此没有已发布的影片，它也会一并撤回。"
            afterDeleteHref="/admin/films"
          />
          <PublishControls
            status={film.statusEn}
            label="英文版"
            onPublish={publishFilmEn.bind(null, film.id)}
            problems={problemsEn}
            onUnpublish={unpublishFilmEn.bind(null, film.id)}
          />
        </div>
      </div>

      <PublishReadiness
        editions={[
          { label: "中文版", published: film.status === "published", problems },
          { label: "英文版", published: film.statusEn === "published", problems: problemsEn },
        ]}
      />

      {film.media.length > 0 && (
        <div className="mt-4 flex gap-2">
          {film.media.slice(0, 6).map((m) => (
            <div key={m.id} className="relative h-16 w-24 bg-ink">
              <Image src={m.url} alt={m.alt ?? ""} fill sizes="96px" className="object-contain" />
            </div>
          ))}
          <GuardedLink
            href={`/admin/media?filmId=${film.id}`}
            className="self-center text-brand text-sm hover:underline"
          >
            管理图片 →
          </GuardedLink>
        </div>
      )}

      <div className="mt-6">
        <FilmForm
          filmId={film.id}
          revision={film.revision}
          people={personRows}
          tags={tagRows}
          media={mediaRows}
          defaultValues={{
            slug: film.slug,
            titleZh: film.titleZh,
            titleZhHk: film.titleZhHk ?? "",
            titleZhTw: film.titleZhTw ?? "",
            titleOriginal: film.titleOriginal,
            titleEn: film.titleEn ?? "",
            year: film.year,
            countries: film.countries.join("、"),
            runtimeMinutes: film.runtimeMinutes ?? "",
            aspectRatio: film.aspectRatio ?? "",
            isBlackAndWhite: film.isBlackAndWhite,
            isSilent: film.isSilent,
            tmdbId: film.tmdbId === null ? "" : String(film.tmdbId),
            imdbId: film.imdbId ?? "",
            doubanId: film.doubanId ?? "",
            wikidataId: film.wikidataId ?? "",
            restorationNote: film.restorationNote ?? "",
            restorationNoteEn: film.restorationNoteEn ?? "",
            introduction: film.introduction ?? "",
            introductionEn: film.introductionEn ?? "",
            editorialNote: film.editorialNote ?? "",
            editorialNoteEn: film.editorialNoteEn ?? "",
            essay: film.essay ?? null,
            essayEn: film.essayEn ?? null,
            cast: film.cast.map((m) => ({
              name: m.name,
              nameZh: m.nameZh ?? "",
              character: m.character ?? "",
              characterZh: m.characterZh ?? "",
              personId: m.personId ?? "",
            })),
            watchLinks: film.watchLinks.map((l) => ({
              platform: l.platform,
              region: l.region as "CN" | "HK" | "TW" | "INTL",
              url: l.url ?? "",
              note: l.note ?? "",
              noteEn: l.noteEn ?? "",
            })),
            directorIds: film.filmDirectors
              .sort((a, b) => a.position - b.position)
              .map((fd) => fd.directorId),
            tagIds: film.filmTags.map((ft) => ft.tagId),
          }}
        />
      </div>
    </div>
  );
}
