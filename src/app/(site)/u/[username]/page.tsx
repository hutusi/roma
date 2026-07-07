import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { userLists, userMarks, users } from "@/db/schema";
import { getSession } from "@/lib/auth-guards";
import { posterOf } from "@/db/queries/public";
import { FilmCard } from "@/components/site/film-card";
import { TitleCard } from "@/components/site/title-card";
import { CreateListButton } from "./create-list-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}`, robots: { index: false } };
}

const TABS = [
  { key: "watched", label: "看过" },
  { key: "want", label: "想看" },
  { key: "lists", label: "片单" },
] as const;

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { username } = await params;
  const { tab: tabParam } = await searchParams;
  const tab = TABS.some((t) => t.key === tabParam) ? tabParam! : "watched";

  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });
  if (!user) notFound();

  const session = await getSession();
  const isOwner = session?.user.id === user.id;

  const [marks, lists] = await Promise.all([
    tab === "lists"
      ? []
      : db.query.userMarks.findMany({
          where: eq(userMarks.userId, user.id),
          orderBy: desc(userMarks.updatedAt),
          with: {
            film: {
              with: { media: true, filmDirectors: { with: { director: true } } },
            },
          },
        }),
    db.query.userLists.findMany({
      where: eq(userLists.userId, user.id),
      orderBy: desc(userLists.updatedAt),
      with: { items: { columns: { id: true } } },
    }),
  ]);

  const visibleMarks = marks.filter(
    (m) => m.status === tab && m.film.status === "published",
  );

  return (
    <div className="mx-auto max-w-3xl animate-fade-up px-6 pt-16">
      <TitleCard eyebrow="Profile" title={user.name} />
      <p className="mt-3 text-center font-display text-sm text-ink-muted">
        @{user.username}
      </p>

      <nav className="mt-10 flex justify-center gap-6 border-b border-line pb-3 text-sm">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/u/${username}?tab=${t.key}`}
            className={
              tab === t.key
                ? "tracking-[0.2em] text-brand"
                : "tracking-[0.2em] text-ink-muted transition-colors hover:text-brand"
            }
          >
            {t.label}
            {t.key === "lists" && lists.length > 0 && `（${lists.length}）`}
          </Link>
        ))}
      </nav>

      {tab !== "lists" && (
        <div className="mt-8 grid gap-4 pb-8 sm:grid-cols-2">
          {visibleMarks.map((mark) => {
            const poster = posterOf(mark.film.media);
            return (
              <FilmCard
                key={mark.filmId}
                slug={mark.film.slug}
                titleZh={mark.film.titleZh}
                titleOriginal={mark.film.titleOriginal}
                year={mark.film.year}
                directors={mark.film.filmDirectors.map(
                  (fd) => fd.director.nameZh ?? fd.director.name,
                )}
                imageUrl={poster?.url}
                imageAlt={poster?.alt}
              />
            );
          })}
          {visibleMarks.length === 0 && (
            <p className="col-span-full py-8 text-center text-ink-muted">
              {tab === "watched" ? "还没有标记看过的影片。" : "还没有想看的影片。"}
            </p>
          )}
        </div>
      )}

      {tab === "lists" && (
        <div className="mt-8 space-y-4 pb-8">
          {isOwner && <CreateListButton username={username} />}
          {lists.map((list) => (
            <Link
              key={list.id}
              href={`/u/${username}/list/${list.id}`}
              className="group flex items-baseline justify-between border border-line bg-card p-5 transition-colors hover:border-brand"
            >
              <span>
                <span className="font-bold transition-colors group-hover:text-brand">
                  {list.title}
                </span>
                {list.description && (
                  <span className="ml-3 text-sm text-ink-muted">
                    {list.description}
                  </span>
                )}
              </span>
              <span className="font-display text-xs tracking-[0.3em] text-ink-muted">
                {list.items.length} FILMS
              </span>
            </Link>
          ))}
          {lists.length === 0 && !isOwner && (
            <p className="py-8 text-center text-ink-muted">还没有创建片单。</p>
          )}
        </div>
      )}
    </div>
  );
}
