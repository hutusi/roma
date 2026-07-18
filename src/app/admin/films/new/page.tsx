import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { media, people } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { FilmForm } from "../film-form";

export const metadata = { title: "新建影片" };

export default async function NewFilmPage() {
  await requireEditor();
  const [personRows, mediaRows] = await Promise.all([
    db
      .select({ id: people.id, name: people.name, nameZh: people.nameZh })
      .from(people)
      .orderBy(asc(people.name)),
    db
      .select({ id: media.id, url: media.url, alt: media.alt })
      .from(media)
      .orderBy(desc(media.createdAt))
      .limit(200),
  ]);

  return (
    <div>
      <h1 className="font-bold text-xl">新建影片</h1>
      <div className="mt-6">
        <FilmForm
          filmId={null}
          people={personRows}
          media={mediaRows}
          tmdbEnabled={Boolean(process.env.TMDB_API_TOKEN)}
          defaultValues={{
            slug: "",
            titleZh: "",
            titleZhHk: "",
            titleZhTw: "",
            titleOriginal: "",
            titleEn: "",
            year: 1950,
            countries: "",
            runtimeMinutes: "",
            aspectRatio: "1.37:1",
            isBlackAndWhite: false,
            editorialNote: "",
            essay: null,
            editorialNoteEn: "",
            essayEn: null,
            cast: [],
            watchLinks: [],
            directorIds: [],
          }}
        />
      </div>
    </div>
  );
}
