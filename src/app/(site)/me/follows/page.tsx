import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { listFollows } from "@/db/schema";
import { requireUser } from "@/lib/auth-guards";
import { TitleCard } from "@/components/site/title-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "关注的片单",
  robots: { index: false },
};

export default async function MyFollowsPage() {
  const session = await requireUser();
  const follows = await db.query.listFollows.findMany({
    where: eq(listFollows.userId, session.user.id),
    orderBy: desc(listFollows.createdAt),
    with: {
      list: { with: { cover: true, items: { columns: { id: true } } } },
    },
  });

  const lists = follows
    .map((f) => f.list)
    .filter((list) => list.status === "published");

  return (
    <div className="mx-auto max-w-3xl animate-fade-up px-6 pt-16">
      <TitleCard eyebrow="Following" title="关注的片单" />
      <div className="mt-10 space-y-6 pb-8">
        {lists.map((list) => (
          <Link
            key={list.id}
            href={`/list/${list.slug}`}
            className="group block border border-line bg-card transition-colors hover:border-brand"
          >
            {list.cover && (
              <div className="relative aspect-[137/60] overflow-hidden bg-ink">
                <Image
                  src={list.cover.url}
                  alt={list.cover.alt ?? list.title}
                  fill
                  sizes="(min-width: 768px) 768px, 100vw"
                  className="object-cover grayscale"
                />
              </div>
            )}
            <div className="p-5 text-center">
              <h2 className="font-bold tracking-[0.1em] transition-colors group-hover:text-brand">
                {list.title}
              </h2>
              {list.theme && (
                <p className="mt-1.5 text-sm text-ink-muted">{list.theme}</p>
              )}
              <p className="mt-2 font-display text-xs tracking-[0.3em] text-ink-muted">
                {list.items.length} FILMS
              </p>
            </div>
          </Link>
        ))}
        {lists.length === 0 && (
          <p className="py-8 text-center text-ink-muted">
            还没有关注任何片单——去
            <Link href="/lists" className="mx-1 text-brand hover:underline">
              片单
            </Link>
            逛逛。
          </p>
        )}
      </div>
    </div>
  );
}
