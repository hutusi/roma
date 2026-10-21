import { asc } from "drizzle-orm";
import Link from "next/link";
import { AdminIndexHeader, ROW_LINK, StatusBadges } from "@/components/admin/list-kit";
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
  await requireEditor("/admin/lists");
  const rows = await db.query.curatedLists.findMany({
    orderBy: asc(curatedLists.sortOrder),
    with: { items: { columns: { id: true } } },
  });

  return (
    <div>
      <AdminIndexHeader
        title="片单"
        count={rows.length}
        action={
          <Button asChild>
            <Link href="/admin/lists/new">新建片单</Link>
          </Button>
        }
      />
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>标题</TableHead>
            <TableHead className="hidden md:table-cell">影片数</TableHead>
            <TableHead className="hidden md:table-cell">排序值</TableHead>
            <TableHead>状态</TableHead>
            <TableHead className="hidden md:table-cell">更新时间</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((list) => (
            <TableRow key={list.id} className="relative">
              <TableCell className="whitespace-normal">
                <Link href={`/admin/lists/${list.id}`} className={ROW_LINK}>
                  {list.title}
                </Link>
                {list.theme && <span className="ml-2 text-ink-muted text-xs">{list.theme}</span>}
              </TableCell>
              <TableCell className="hidden md:table-cell">{list.items.length}</TableCell>
              <TableCell className="hidden text-ink-muted md:table-cell">
                {list.sortOrder}
              </TableCell>
              <TableCell>
                <StatusBadges status={list.status} statusEn={list.statusEn} />
              </TableCell>
              <TableCell className="hidden text-ink-muted md:table-cell">
                {list.updatedAt.toLocaleString("zh-CN", { dateStyle: "short", timeStyle: "short" })}
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-ink-muted">
                还没有片单——片单是八部半的核心，从这里开始
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
