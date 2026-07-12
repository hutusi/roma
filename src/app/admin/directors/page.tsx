import { desc } from "drizzle-orm";
import Link from "next/link";
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
import { directors } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";

export const metadata = { title: "导演管理" };

export default async function AdminDirectorsPage() {
  await requireEditor();
  const rows = await db.query.directors.findMany({
    orderBy: desc(directors.updatedAt),
    limit: 200,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-xl">导演</h1>
        <Button asChild>
          <Link href="/admin/directors/new">新建导演</Link>
        </Button>
      </div>
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>姓名</TableHead>
            <TableHead>slug</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>更新时间</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((d) => (
            <TableRow key={d.id}>
              <TableCell>
                <Link href={`/admin/directors/${d.id}`} className="font-medium hover:text-brand">
                  {d.nameZh ?? d.name}
                </Link>
                <span className="ml-2 text-ink-muted text-xs">{d.name}</span>
              </TableCell>
              <TableCell className="text-ink-muted">{d.slug}</TableCell>
              <TableCell>
                <span className="flex gap-1.5">
                  <Badge variant={d.status === "published" ? "default" : "secondary"}>
                    {d.status === "published" ? "已发布" : "草稿"}
                  </Badge>
                  {d.statusEn === "published" && <Badge variant="outline">EN</Badge>}
                </span>
              </TableCell>
              <TableCell className="text-ink-muted">
                {d.updatedAt.toLocaleDateString("zh-CN")}
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-ink-muted">
                还没有导演条目
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
