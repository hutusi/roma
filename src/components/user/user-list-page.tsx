import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { FilmCard } from "@/components/site/film-card";
import { TitleCard } from "@/components/site/title-card";
import { db } from "@/db";
import { posterOf } from "@/db/queries/public";
import { filmDirectors, films, media, userListItems, userLists } from "@/db/schema";
import { getDict } from "@/i18n/dict";
import { type Locale, localePath } from "@/i18n/locales";
import { getSession } from "@/lib/auth-guards";
import { OwnerPanel } from "./owner-panel";

/**
 * A single user-created list, rendered for both locales. The list title and
 * description are user-authored (never translated); film titles resolve to
 * English on /en and link to /en when the film has a published English
 * edition, else fall back to its zh page.
 */
export async function UserListPage({
  username,
  id,
  locale = "zh",
}: {
  username: string;
  id: string;
  locale?: Locale;
}) {
  const en = locale === "en";
  const t = getDict(locale).userList;

  const list = await db.query.userLists.findFirst({
    where: eq(userLists.id, id),
    with: {
      user: true,
      items: {
        // The list's order IS the list; id breaks ties deterministically.
        orderBy: [asc(userListItems.position), asc(userListItems.id)],
        // posterOf takes the first row of the preferred kind, so the
        // relation has to arrive ordered or the poster is arbitrary.
        with: {
          film: {
            with: {
              media: { orderBy: [asc(media.sortOrder), asc(media.id)] },
              filmDirectors: {
                with: { director: true as const },
                orderBy: [asc(filmDirectors.position), asc(filmDirectors.directorId)],
              },
            },
          },
        },
      },
    },
  });
  if (!list || list.user.username !== username) notFound();

  const session = await getSession();
  const isOwner = session?.user.id === list.userId;
  // Ordering is the query's job (asc position); the public render drops
  // unpublished members, but the OWNER must still see them. Filtering
  // before the isOwner branch made them invisible-but-present: the owner
  // couldn't remove them, every drag then sent a partial permutation that
  // silently collided positions, and re-publishing dead-ended on
  // "alreadyInList" for a row they couldn't see.
  const ownerItems = list.items;
  const items = ownerItems.filter((item) => item.film.status === "published");

  const filmTitle = (f: { titleZh: string; titleEn: string | null; titleOriginal: string }) =>
    en ? (f.titleEn ?? f.titleOriginal) : f.titleZh;
  const filmHref = (f: { slug: string }) => localePath(locale, `/film/${f.slug}`);

  const filmOptions = isOwner
    ? (
        await db
          .select({
            id: films.id,
            titleZh: films.titleZh,
            titleEn: films.titleEn,
            titleOriginal: films.titleOriginal,
            year: films.year,
          })
          .from(films)
          .where(eq(films.status, "published"))
          .orderBy(asc(films.year))
      ).map((f) => ({ id: f.id, title: filmTitle(f), year: f.year }))
    : [];

  return (
    <div className="mx-auto max-w-3xl animate-fade-up px-6 pt-16">
      <TitleCard eyebrow={`@${username}${t.listSuffix}`} title={list.title} />
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
          initialItems={ownerItems.map((item) => {
            const unavailable = item.film.status !== "published";
            return {
              id: item.id,
              filmId: item.film.id,
              // No title for an unavailable film: it's unpublished
              // editorial work that may have been renamed or pulled, and
              // the owner isn't an editor. Position plus a remove button
              // is all they need to get unstuck.
              title: unavailable ? "" : filmTitle(item.film),
              year: item.film.year,
              unavailable,
            };
          })}
          locale={locale}
          labels={t}
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
                  href={filmHref(item.film)}
                  title={filmTitle(item.film)}
                  subtitle={item.film.titleOriginal}
                  year={item.film.year}
                  directorsLabel={item.film.filmDirectors
                    .map((fd) => (en ? fd.director.name : (fd.director.nameZh ?? fd.director.name)))
                    .join(en ? ", " : "、")}
                  imageUrl={poster?.url}
                  imageAlt={poster?.alt}
                />
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="py-8 text-center text-ink-muted">
            {isOwner ? t.emptyOwner : t.emptyViewer}
          </p>
        )}
      </div>
    </div>
  );
}
