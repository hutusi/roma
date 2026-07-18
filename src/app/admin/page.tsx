import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { curatedLists, films, people } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";

export const metadata = { title: "编辑部" };

async function countByStatus(table: typeof films | typeof people | typeof curatedLists) {
  const [total] = await db.select({ n: count() }).from(table);
  const [drafts] = await db.select({ n: count() }).from(table).where(eq(table.status, "draft"));
  return { total: total.n, drafts: drafts.n };
}

export default async function AdminDashboard() {
  await requireEditor();
  const [filmStats, peopleStats, listStats] = await Promise.all([
    countByStatus(films),
    countByStatus(people),
    countByStatus(curatedLists),
  ]);

  const cards = [
    { label: "影片", stats: filmStats },
    { label: "人物", stats: peopleStats },
    { label: "片单", stats: listStats },
  ];

  return (
    <div>
      <h1 className="font-bold text-xl">仪表盘</h1>
      <div className="mt-6 grid max-w-2xl grid-cols-3 gap-4">
        {cards.map(({ label, stats }) => (
          <div key={label} className="border border-line bg-card p-4">
            <p className="text-ink-muted text-sm">{label}</p>
            <p className="mt-2 font-bold text-2xl">{stats.total}</p>
            <p className="mt-1 text-ink-muted text-xs">
              草稿 {stats.drafts} · 已发布 {stats.total - stats.drafts}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
