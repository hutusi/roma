import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { films, media, people } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { MediaManager } from "./media-manager";

export const metadata = { title: "媒体库" };

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ filmId?: string }>;
}) {
  await requireEditor();
  const { filmId } = await searchParams;
  const [rows, filmRows, personRows] = await Promise.all([
    db.query.media.findMany({
      where: filmId ? eq(media.filmId, filmId) : undefined,
      orderBy: desc(media.createdAt),
      limit: 300,
    }),
    db.select({ id: films.id, title: films.titleZh }).from(films).orderBy(asc(films.titleZh)),
    db
      .select({ id: people.id, name: people.name, nameZh: people.nameZh })
      .from(people)
      .orderBy(asc(people.name)),
  ]);

  return (
    <div>
      <h1 className="font-bold text-xl">媒体库</h1>
      <MediaManager
        rows={rows.map((m) => ({
          id: m.id,
          url: m.url,
          alt: m.alt ?? "",
          credit: m.credit ?? "",
          kind: m.kind,
          filmId: m.filmId,
          personId: m.personId,
        }))}
        films={filmRows}
        people={personRows.map((d) => ({
          id: d.id,
          name: d.nameZh ?? d.name,
        }))}
        activeFilmId={filmId ?? null}
      />
    </div>
  );
}
