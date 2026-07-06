import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { directors, media } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { FilmForm } from "../film-form";

export const metadata = { title: "新建影片" };

export default async function NewFilmPage() {
  await requireEditor();
  const [directorRows, mediaRows] = await Promise.all([
    db
      .select({ id: directors.id, name: directors.name, nameZh: directors.nameZh })
      .from(directors)
      .orderBy(asc(directors.name)),
    db
      .select({ id: media.id, url: media.url, alt: media.alt })
      .from(media)
      .orderBy(desc(media.createdAt))
      .limit(200),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold">新建影片</h1>
      <div className="mt-6">
        <FilmForm
          filmId={null}
          directors={directorRows}
          media={mediaRows}
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
            isBlackAndWhite: true,
            editorialNote: "",
            essay: null,
            cast: [],
            watchLinks: [],
            directorIds: [],
          }}
        />
      </div>
    </div>
  );
}
