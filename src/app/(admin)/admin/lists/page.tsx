import { asc } from "drizzle-orm";
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
import { curatedLists } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";

export const metadata = { title: "片单管理" };

export default async function AdminListsPage() {
  await requireEditor();
  const rows = await db.query.curatedLists.findMany({
    orderBy: asc(curatedLists.sortOrder),
    with: { items: { columns: { id: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-xl">片单</h1>
        <Button asChild>
          <Link href="/admin/lists/new">新建片单</Link>
        </Button>
      </div>
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>标题</TableHead>
            <TableHead>影片数</TableHead>
            <TableHead>排序值</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>更新时间</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((list) => (
            <TableRow key={list.id}>
              <TableCell>
                <Link href={`/admin/lists/${list.id}`} className="font-medium hover:text-brand">
                  {list.title}
                </Link>
                {list.theme && <span className="ml-2 text-ink-muted text-xs">{list.theme}</span>}
              </TableCell>
              <TableCell>{list.items.length}</TableCell>
              <TableCell className="text-ink-muted">{list.sortOrder}</TableCell>
              <TableCell>
                <Badge variant={list.status === "published" ? "default" : "secondary"}>
                  {list.status === "published" ? "已发布" : "草稿"}
                </Badge>
              </TableCell>
              <TableCell className="text-ink-muted">
                {list.updatedAt.toLocaleDateString("zh-CN")}
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-ink-muted">
                还没有片单——片单是八部半的核心，从这里开始
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
