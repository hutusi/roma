import Link from "next/link";
import { desc, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { films } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "影片管理" };

export default async function AdminFilmsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireEditor();
  const { q } = await searchParams;
  const rows = await db.query.films.findMany({
    where: q
      ? or(
          ilike(films.titleZh, `%${q}%`),
          ilike(films.titleOriginal, `%${q}%`),
          ilike(films.slug, `%${q}%`),
        )
      : undefined,
    orderBy: desc(films.updatedAt),
    limit: 200,
    with: { filmDirectors: { with: { director: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">影片</h1>
        <Button asChild>
          <Link href="/admin/films/new">新建影片</Link>
        </Button>
      </div>
      <form className="mt-4 max-w-sm" action="/admin/films">
        <Input name="q" placeholder="按标题或 slug 搜索…" defaultValue={q} />
      </form>
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>标题</TableHead>
            <TableHead>年份</TableHead>
            <TableHead>导演</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>更新时间</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((film) => (
            <TableRow key={film.id}>
              <TableCell>
                <Link
                  href={`/admin/films/${film.id}`}
                  className="font-medium hover:text-brand"
                >
                  {film.titleZh}
                </Link>
                <span className="ml-2 text-xs text-ink-muted">
                  {film.titleOriginal}
                </span>
              </TableCell>
              <TableCell>{film.year}</TableCell>
              <TableCell className="text-ink-muted">
                {film.filmDirectors
                  .map((fd) => fd.director.nameZh ?? fd.director.name)
                  .join("、")}
              </TableCell>
              <TableCell>
                <Badge variant={film.status === "published" ? "default" : "secondary"}>
                  {film.status === "published" ? "已发布" : "草稿"}
                </Badge>
              </TableCell>
              <TableCell className="text-ink-muted">
                {film.updatedAt.toLocaleDateString("zh-CN")}
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-ink-muted">
                {q ? "没有匹配的影片" : "还没有影片——从「新建影片」开始"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
