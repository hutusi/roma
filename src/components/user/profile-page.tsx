import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilmCard } from "@/components/site/film-card";
import { TitleCard } from "@/components/site/title-card";
import { db } from "@/db";
import { posterOf } from "@/db/queries/public";
import { userLists, userMarks, users } from "@/db/schema";
import { getDict } from "@/i18n/dict";
import { type Locale, localePath } from "@/i18n/locales";
import { getSession } from "@/lib/auth-guards";
import { CreateListButton } from "./create-list-button";

const TAB_KEYS = ["watched", "want", "lists"] as const;
type Tab = (typeof TAB_KEYS)[number];

/**
 * A user's public profile (watched / want / lists tabs), rendered for both
 * locales. Chrome comes from the dictionary; the user's own marks and lists
 * are shown in full — film titles resolve to English on /en, and each film
 * links to /en when it has a published English edition, else falls back to
 * its zh page (so a user's data never dead-links).
 */
export async function ProfilePage({
  username,
  tab: tabParam,
  locale = "zh",
}: {
  username: string;
  tab?: string;
  locale?: Locale;
}) {
  const en = locale === "en";
  const dict = getDict(locale);
  const t = dict.profile;
  const tab: Tab = TAB_KEYS.find((k) => k === tabParam) ?? "watched";

  const user = await db.query.users.findFirst({ where: eq(users.username, username) });
  if (!user) notFound();

  const session = await getSession();
  const isOwner = session?.user.id === user.id;

  const [marks, lists] = await Promise.all([
    tab === "lists"
      ? []
      : db.query.userMarks.findMany({
          where: eq(userMarks.userId, user.id),
          orderBy: desc(userMarks.updatedAt),
          with: { film: { with: { media: true, filmDirectors: { with: { director: true } } } } },
        }),
    db.query.userLists.findMany({
      where: eq(userLists.userId, user.id),
      orderBy: desc(userLists.updatedAt),
      with: { items: { columns: { id: true } } },
    }),
  ]);

  const visibleMarks = marks.filter((m) => m.status === tab && m.film.status === "published");
  const filmHref = (f: { slug: string; statusEn: string }) =>
    en && f.statusEn === "published" ? `/en/film/${f.slug}` : `/film/${f.slug}`;

  return (
    <div className="mx-auto max-w-3xl animate-fade-up px-6 pt-16">
      <TitleCard eyebrow="Profile" title={user.name} />
      <p className="mt-3 text-center font-display text-ink-muted text-sm">@{user.username}</p>

      <nav className="mt-10 flex justify-center gap-6 border-line border-b pb-3 text-sm">
        {TAB_KEYS.map((key) => (
          <Link
            key={key}
            href={localePath(locale, `/u/${username}?tab=${key}`)}
            className={
              tab === key
                ? "text-brand tracking-[0.2em]"
                : "text-ink-muted tracking-[0.2em] transition-colors hover:text-brand"
            }
          >
            {t.tabs[key]}
            {key === "lists" &&
              lists.length > 0 &&
              (en ? ` (${lists.length})` : `（${lists.length}）`)}
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
                href={filmHref(mark.film)}
                title={en ? (mark.film.titleEn ?? mark.film.titleOriginal) : mark.film.titleZh}
                subtitle={mark.film.titleOriginal}
                year={mark.film.year}
                directorsLabel={mark.film.filmDirectors
                  .map((fd) => (en ? fd.director.name : (fd.director.nameZh ?? fd.director.name)))
                  .join(en ? ", " : "、")}
                imageUrl={poster?.url}
                imageAlt={poster?.alt}
              />
            );
          })}
          {visibleMarks.length === 0 && (
            <p className="col-span-full py-8 text-center text-ink-muted">
              {tab === "watched" ? t.emptyWatched : t.emptyWant}
            </p>
          )}
        </div>
      )}

      {tab === "lists" && (
        <div className="mt-8 space-y-4 pb-8">
          {isOwner && (
            <CreateListButton username={username} locale={locale} labels={dict.userList} />
          )}
          {lists.map((list) => (
            <Link
              key={list.id}
              href={localePath(locale, `/u/${username}/list/${list.id}`)}
              className="group flex items-baseline justify-between border border-line bg-card p-5 transition-colors hover:border-brand"
            >
              <span>
                <span className="font-bold transition-colors group-hover:text-brand">
                  {list.title}
                </span>
                {list.description && (
                  <span className="ml-3 text-ink-muted text-sm">{list.description}</span>
                )}
              </span>
              <span className="font-display text-ink-muted text-xs tracking-[0.3em]">
                {list.items.length} FILMS
              </span>
            </Link>
          ))}
          {lists.length === 0 && !isOwner && (
            <p className="py-8 text-center text-ink-muted">{t.emptyLists}</p>
          )}
        </div>
      )}
    </div>
  );
}
