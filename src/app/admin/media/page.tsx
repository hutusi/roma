import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import Link from "next/link";
import {
  AdminIndexHeader,
  AdminPagination,
  AdminSearch,
  indexHref,
  likePattern,
  PAGE_SIZE,
  pageParam,
} from "@/components/admin/list-kit";
import { db } from "@/db";
import { films, media, people } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { MediaManager } from "./media-manager";

export const metadata = { title: "媒体库" };

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ filmId?: string; q?: string; page?: string }>;
}) {
  await requireEditor("/admin/media");
  const { filmId: rawFilmId, q: rawQ, page: rawPage } = await searchParams;
  const filmId = rawFilmId || undefined;
  const q = rawQ?.trim() || undefined;
  const page = pageParam(rawPage);
  const where = and(
    filmId ? eq(media.filmId, filmId) : undefined,
    q
      ? or(
          ilike(media.alt, likePattern(q)),
          ilike(media.credit, likePattern(q)),
          ilike(media.pathname, likePattern(q)),
        )
      : undefined,
  );
  const [rows, [{ total }], filmRows, personRows] = await Promise.all([
    db.query.media.findMany({
      where,
      orderBy: [desc(media.createdAt), desc(media.id)],
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    db.select({ total: count() }).from(media).where(where),
    db.select({ id: films.id, title: films.titleZh }).from(films).orderBy(asc(films.titleZh)),
    db
      .select({ id: people.id, name: people.name, nameZh: people.nameZh })
      .from(people)
      .orderBy(asc(people.name)),
  ]);
  const filterFilm = filmId ? filmRows.find((f) => f.id === filmId) : undefined;

  return (
    <div>
      <AdminIndexHeader title="媒体库" count={total} />
      {/* The film filter used to be invisible: arriving from a film's
          "管理图片" left the library looking oddly small, with no way back
          to the rest short of editing the URL. */}
      {filmId && (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-sm bg-accent px-2 py-0.5">
            仅显示《{filterFilm?.title ?? "未知影片"}》的图片
          </span>
          <Link href={indexHref("/admin/media", { q })} className="text-brand hover:underline">
            显示全部
          </Link>
        </p>
      )}
      <AdminSearch
        action="/admin/media"
        q={q}
        placeholder="按说明、来源或文件名搜索"
        keep={{ filmId }}
      />
      <MediaManager
        rows={rows.map((m) => ({
          id: m.id,
          url: m.url,
          alt: m.alt ?? "",
          credit: m.credit,
          kind: m.kind,
          filmId: m.filmId,
          personId: m.personId,
        }))}
        films={filmRows}
        people={personRows.map((d) => ({ id: d.id, name: d.nameZh ?? d.name }))}
        activeFilmId={filmId ?? null}
        filtered={Boolean(filmId || q)}
      />
      <AdminPagination basePath="/admin/media" page={page} total={total} q={q} keep={{ filmId }} />
    </div>
  );
}
