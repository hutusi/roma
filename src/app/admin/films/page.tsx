import { count, desc, ilike, or } from "drizzle-orm";
import Link from "next/link";
import {
  AdminIndexHeader,
  AdminPagination,
  AdminSearch,
  likePattern,
  PAGE_SIZE,
  pageParam,
  ROW_LINK,
  StatusBadges,
} from "@/components/admin/list-kit";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { films } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";

export const metadata = { title: "影片管理" };

export default async function AdminFilmsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireEditor("/admin/films");
  const { q: rawQ, page: rawPage } = await searchParams;
  const q = rawQ?.trim() || undefined;
  const page = pageParam(rawPage);
  const where = q
    ? or(
        ilike(films.titleZh, likePattern(q)),
        ilike(films.titleOriginal, likePattern(q)),
        ilike(films.titleEn, likePattern(q)),
        ilike(films.slug, likePattern(q)),
      )
    : undefined;
  const [rows, [{ total }]] = await Promise.all([
    db.query.films.findMany({
      where,
      orderBy: desc(films.updatedAt),
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      with: { filmDirectors: { with: { director: true } } },
    }),
    db.select({ total: count() }).from(films).where(where),
  ]);

  return (
    <div>
      <AdminIndexHeader
        title="影片"
        count={total}
        action={
          <Button asChild>
            <Link href="/admin/films/new">新建影片</Link>
          </Button>
        }
      />
      <AdminSearch action="/admin/films" q={q} placeholder="按标题或 slug 搜索…" />
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>标题</TableHead>
            <TableHead className="hidden md:table-cell">年份</TableHead>
            <TableHead className="hidden md:table-cell">导演</TableHead>
            <TableHead>状态</TableHead>
            <TableHead className="hidden md:table-cell">更新时间</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((film) => (
            <TableRow key={film.id} className="relative">
              <TableCell className="whitespace-normal">
                <Link href={`/admin/films/${film.id}`} className={ROW_LINK}>
                  {film.titleZh}
                </Link>
                <span className="ml-2 text-ink-muted text-xs">{film.titleOriginal}</span>
              </TableCell>
              <TableCell className="hidden md:table-cell">{film.year}</TableCell>
              <TableCell className="hidden text-ink-muted md:table-cell">
                {film.filmDirectors.map((fd) => fd.director.nameZh ?? fd.director.name).join("、")}
              </TableCell>
              <TableCell>
                <StatusBadges status={film.status} statusEn={film.statusEn} />
              </TableCell>
              <TableCell className="hidden text-ink-muted md:table-cell">
                {film.updatedAt.toLocaleString("zh-CN", { dateStyle: "short", timeStyle: "short" })}
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-ink-muted">
                {q ? `没有匹配「${q}」的影片` : "还没有影片——从「新建影片」开始"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <AdminPagination basePath="/admin/films" page={page} total={total} q={q} />
    </div>
  );
}
