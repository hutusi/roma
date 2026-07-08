import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FilmCard } from "@/components/site/film-card";
import { TitleCard } from "@/components/site/title-card";
import { db } from "@/db";
import { posterOf } from "@/db/queries/public";
import { films, userLists } from "@/db/schema";
import { getSession } from "@/lib/auth-guards";
import { OwnerPanel } from "./owner-panel";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { robots: { index: false } };
}

export default async function UserListPage({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}) {
  const { username, id } = await params;
  const list = await db.query.userLists.findFirst({
    where: eq(userLists.id, id),
    with: {
      user: true,
      items: {
        with: {
          film: {
            with: { media: true, filmDirectors: { with: { director: true } } },
          },
        },
      },
    },
  });
  if (!list || list.user.username !== username) notFound();

  const session = await getSession();
  const isOwner = session?.user.id === list.userId;
  const items = [...list.items]
    .sort((a, b) => a.position - b.position)
    .filter((item) => item.film.status === "published");

  const filmOptions = isOwner
    ? await db
        .select({ id: films.id, title: films.titleZh, year: films.year })
        .from(films)
        .where(eq(films.status, "published"))
        .orderBy(asc(films.year))
    : [];

  return (
    <div className="mx-auto max-w-3xl animate-fade-up px-6 pt-16">
      <TitleCard eyebrow={`@${username} 的片单`} title={list.title} />
      {list.description && (
        <p className="mt-4 text-center text-ink-muted text-sm">{list.description}</p>
      )}

      {isOwner ? (
        <OwnerPanel
          listId={list.id}
          username={username}
          title={list.title}
          description={list.description ?? ""}
          filmOptions={filmOptions}
          initialItems={items.map((item) => ({
            id: item.id,
            filmId: item.film.id,
            title: item.film.titleZh,
            year: item.film.year,
          }))}
        />
      ) : null}

      <div className="mt-10 space-y-4 pb-8">
        {items.map((item, index) => {
          const poster = posterOf(item.film.media);
          return (
            <div key={item.id} className="flex items-start gap-3">
              <span className="mt-6 w-8 shrink-0 text-right font-display text-ink-muted text-xl">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <FilmCard
                  slug={item.film.slug}
                  titleZh={item.film.titleZh}
                  titleOriginal={item.film.titleOriginal}
                  year={item.film.year}
                  directors={item.film.filmDirectors.map(
                    (fd) => fd.director.nameZh ?? fd.director.name,
                  )}
                  imageUrl={poster?.url}
                  imageAlt={poster?.alt}
                />
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="py-8 text-center text-ink-muted">
            {isOwner ? "从上方加入第一部影片。" : "这份片单还是空的。"}
          </p>
        )}
      </div>
    </div>
  );
}
