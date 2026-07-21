import { asc, desc, eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteFilm,
  publishFilm,
  publishFilmEn,
  unpublishFilm,
  unpublishFilmEn,
} from "@/actions/films";
import { db } from "@/db";
import { films, media, people, tags } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
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

  const [personRows, tagRows, mediaRows] = await Promise.all([
    db
      .select({ id: people.id, name: people.name, nameZh: people.nameZh })
      .from(people)
      .orderBy(asc(people.name)),
    db.select({ id: tags.id, nameZh: tags.nameZh }).from(tags).orderBy(asc(tags.slug)),
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
          编辑影片 · {film.titleZh}
          <Link
            href={`/admin/preview/film/${film.id}`}
            className="ml-3 font-normal text-brand text-sm hover:underline"
          >
            预览
          </Link>
          <Link
            href={`/admin/preview/film/${film.id}?locale=en`}
            className="ml-2 font-normal text-brand text-sm hover:underline"
          >
            EN 预览
          </Link>
        </h1>
        <div className="flex items-center gap-6">
          <PublishControls
            status={film.status}
            onPublish={publishFilm.bind(null, film.id)}
            onUnpublish={unpublishFilm.bind(null, film.id)}
            onDelete={deleteFilm.bind(null, film.id)}
            deleteConfirmText={`确定删除《${film.titleZh}》？该操作不可撤销。`}
            afterDeleteHref="/admin/films"
          />
          <PublishControls
            status={film.statusEn}
            label="英文版"
            onPublish={publishFilmEn.bind(null, film.id)}
            onUnpublish={unpublishFilmEn.bind(null, film.id)}
          />
        </div>
      </div>

      {film.media.length > 0 && (
        <div className="mt-4 flex gap-2">
          {film.media.slice(0, 6).map((m) => (
            <div key={m.id} className="relative h-16 w-24 bg-ink">
              <Image src={m.url} alt={m.alt ?? ""} fill sizes="96px" className="object-contain" />
            </div>
          ))}
          <Link
            href={`/admin/media?filmId=${film.id}`}
            className="self-center text-brand text-sm hover:underline"
          >
            管理图片 →
          </Link>
        </div>
      )}

      <div className="mt-6">
        <FilmForm
          filmId={film.id}
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
            editorialNote: film.editorialNote ?? "",
            essay: film.essay ?? null,
            editorialNoteEn: film.editorialNoteEn ?? "",
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
