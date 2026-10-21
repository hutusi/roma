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
import { Badge } from "@/components/ui/badge";
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
import { people } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";

export const metadata = { title: "人物管理" };

export default async function AdminPeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireEditor("/admin/people");
  const { q: rawQ, page: rawPage } = await searchParams;
  const q = rawQ?.trim() || undefined;
  const page = pageParam(rawPage);
  const where = q
    ? or(
        ilike(people.name, likePattern(q)),
        ilike(people.nameZh, likePattern(q)),
        ilike(people.slug, likePattern(q)),
      )
    : undefined;
  const [rows, [{ total }]] = await Promise.all([
    db.query.people.findMany({
      where,
      orderBy: desc(people.updatedAt),
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    db.select({ total: count() }).from(people).where(where),
  ]);

  return (
    <div>
      <AdminIndexHeader
        title="人物"
        count={total}
        action={
          <Button asChild>
            <Link href="/admin/people/new">新建人物</Link>
          </Button>
        }
      />
      <AdminSearch action="/admin/people" q={q} placeholder="按姓名或 slug 搜索…" />
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>姓名</TableHead>
            <TableHead className="hidden md:table-cell">类型</TableHead>
            <TableHead className="hidden md:table-cell">slug</TableHead>
            <TableHead>状态</TableHead>
            <TableHead className="hidden md:table-cell">更新时间</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((d) => (
            <TableRow key={d.id} className="relative">
              <TableCell className="whitespace-normal">
                <Link href={`/admin/people/${d.id}`} className={ROW_LINK}>
                  {d.nameZh ?? d.name}
                </Link>
                <span className="ml-2 text-ink-muted text-xs">{d.name}</span>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline">{d.primaryRole === "actor" ? "演员" : "导演"}</Badge>
              </TableCell>
              <TableCell className="hidden text-ink-muted md:table-cell">{d.slug}</TableCell>
              <TableCell>
                <StatusBadges status={d.status} statusEn={d.statusEn} />
              </TableCell>
              <TableCell className="hidden text-ink-muted md:table-cell">
                {d.updatedAt.toLocaleString("zh-CN", { dateStyle: "short", timeStyle: "short" })}
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-ink-muted">
                {q ? `没有匹配「${q}」的人物` : "还没有人物条目——从「新建人物」开始"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <AdminPagination basePath="/admin/people" page={page} total={total} q={q} />
    </div>
  );
}
