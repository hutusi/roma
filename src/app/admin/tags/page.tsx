import { asc, count, eq } from "drizzle-orm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { filmTags, tags } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { TagCreateForm, TagRow } from "./tag-controls";

export const metadata = { title: "标签" };

export default async function AdminTagsPage() {
  await requireEditor();
  const rows = await db
    .select({
      id: tags.id,
      slug: tags.slug,
      nameZh: tags.nameZh,
      nameEn: tags.nameEn,
      filmCount: count(filmTags.filmId),
    })
    .from(tags)
    .leftJoin(filmTags, eq(filmTags.tagId, tags.id))
    .groupBy(tags.id)
    .orderBy(asc(tags.slug));

  return (
    <div>
      <h1 className="font-bold text-xl">标签</h1>
      <p className="mt-2 text-ink-muted text-sm">
        策展词汇表：中英文名都必填，影片编辑页只能从这里选。黑白/彩色是影片属性，不设标签。
      </p>
      <div className="mt-6 max-w-2xl">
        <TagCreateForm />
      </div>
      <Table className="mt-8">
        <TableHeader>
          <TableRow>
            <TableHead>slug</TableHead>
            <TableHead>中文名</TableHead>
            <TableHead>英文名</TableHead>
            <TableHead>影片</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ filmCount, ...tag }) => (
            <TagRow key={tag.id} tag={tag} filmCount={filmCount} />
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-ink-muted">
                还没有标签
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
