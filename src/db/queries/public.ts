import "server-only";
import { and, arrayContains, asc, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { curatedLists, directors, films, media } from "@/db/schema";

/**
 * Read layer for the public site and the admin draft preview. The
 * `*BySlug` functions only ever return published rows (public pages 404
 * on drafts); the `*ForPreview` functions fetch by id with no status
 * filter and sit behind requireEditor().
 */

export async function getPublishedFilmBySlug(slug: string) {
  const film = await db.query.films.findFirst({
    where: and(eq(films.slug, slug), eq(films.status, "published")),
    with: {
      filmDirectors: { with: { director: true } },
      watchLinks: true,
      media: true,
      listItems: { with: { list: true } },
    },
  });
  if (!film) return null;
  return normalizeFilm(film);
}

export async function getFilmForPreview(id: string) {
  const film = await db.query.films.findFirst({
    where: eq(films.id, id),
    with: {
      filmDirectors: { with: { director: true } },
      watchLinks: true,
      media: true,
      listItems: { with: { list: true } },
    },
  });
  if (!film) return null;
  return normalizeFilm(film);
}

function normalizeFilm(
  film: NonNullable<Awaited<ReturnType<typeof rawFilm>>>,
) {
  return {
    ...film,
    filmDirectors: [...film.filmDirectors].sort((a, b) => a.position - b.position),
    watchLinks: [...film.watchLinks].sort((a, b) => a.sortOrder - b.sortOrder),
    media: [...film.media].sort((a, b) => a.sortOrder - b.sortOrder),
    relatedLists: film.listItems
      .map((item) => item.list)
      .filter((list) => list.status === "published"),
  };
}

// Only used to derive the relation-shaped type for normalizeFilm.
async function rawFilm() {
  return db.query.films.findFirst({
    with: {
      filmDirectors: { with: { director: true } },
      watchLinks: true,
      media: true,
      listItems: { with: { list: true } },
    },
  });
}

export type PublicFilm = NonNullable<Awaited<ReturnType<typeof getPublishedFilmBySlug>>>;

export async function getPublishedFilms(filters?: {
  decade?: number;
  country?: string;
}) {
  const conditions = [eq(films.status, "published")];
  if (filters?.decade) {
    conditions.push(gte(films.year, filters.decade));
    conditions.push(lte(films.year, filters.decade + 9));
  }
  if (filters?.country) {
    conditions.push(arrayContains(films.countries, [filters.country]));
  }
  return db.query.films.findMany({
    where: and(...conditions),
    orderBy: [asc(films.year), asc(films.slug)],
    with: {
      filmDirectors: { with: { director: true } },
      media: true,
    },
  });
}

export type PublicFilmListItem = Awaited<ReturnType<typeof getPublishedFilms>>[number];

export async function getPublishedFilmSlugs() {
  return db
    .select({ slug: films.slug })
    .from(films)
    .where(eq(films.status, "published"));
}

export async function getPublishedDirectorBySlug(slug: string) {
  const director = await db.query.directors.findFirst({
    where: and(eq(directors.slug, slug), eq(directors.status, "published")),
    with: directorRelations,
  });
  return director ? normalizeDirector(director) : null;
}

export async function getDirectorForPreview(id: string) {
  const director = await db.query.directors.findFirst({
    where: eq(directors.id, id),
    with: directorRelations,
  });
  return director ? normalizeDirector(director) : null;
}

const directorRelations = {
  viewingItems: { with: { film: true } },
  filmDirectors: { with: { film: { with: { media: true } } } },
  media: true,
} as const;

function normalizeDirector(
  director: NonNullable<Awaited<ReturnType<typeof rawDirector>>>,
) {
  return {
    ...director,
    viewingItems: [...director.viewingItems]
      .sort((a, b) => a.position - b.position)
      .filter((item) => item.film.status === "published"),
    films: director.filmDirectors
      .map((fd) => fd.film)
      .filter((film) => film.status === "published")
      .sort((a, b) => a.year - b.year),
  };
}

async function rawDirector() {
  return db.query.directors.findFirst({ with: directorRelations });
}

export type PublicDirector = NonNullable<
  Awaited<ReturnType<typeof getPublishedDirectorBySlug>>
>;

export async function getPublishedDirectorSlugs() {
  return db
    .select({ slug: directors.slug })
    .from(directors)
    .where(eq(directors.status, "published"));
}

const listRelations = {
  items: {
    with: {
      film: {
        with: {
          filmDirectors: { with: { director: true } },
          media: true,
        },
      },
    },
  },
  cover: true,
} as const;

export async function getPublishedListBySlug(slug: string) {
  const list = await db.query.curatedLists.findFirst({
    where: and(eq(curatedLists.slug, slug), eq(curatedLists.status, "published")),
    with: listRelations,
  });
  return list ? normalizeList(list) : null;
}

export async function getListForPreview(id: string) {
  const list = await db.query.curatedLists.findFirst({
    where: eq(curatedLists.id, id),
    with: listRelations,
  });
  return list ? normalizeList(list) : null;
}

function normalizeList(list: NonNullable<Awaited<ReturnType<typeof rawList>>>) {
  return {
    ...list,
    items: [...list.items].sort((a, b) => a.position - b.position),
  };
}

async function rawList() {
  return db.query.curatedLists.findFirst({ with: listRelations });
}

export type PublicList = NonNullable<Awaited<ReturnType<typeof getPublishedListBySlug>>>;

export async function getPublishedLists() {
  const lists = await db.query.curatedLists.findMany({
    where: eq(curatedLists.status, "published"),
    orderBy: [asc(curatedLists.sortOrder), desc(curatedLists.publishedAt)],
    with: { items: { columns: { id: true } }, cover: true },
  });
  return lists;
}

export type PublicListSummary = Awaited<ReturnType<typeof getPublishedLists>>[number];

export async function getPublishedListSlugs() {
  return db
    .select({ slug: curatedLists.slug })
    .from(curatedLists)
    .where(eq(curatedLists.status, "published"));
}

export async function getHomeData() {
  const [lists, recentFilms] = await Promise.all([
    getPublishedLists(),
    db.query.films.findMany({
      where: eq(films.status, "published"),
      orderBy: desc(films.publishedAt),
      limit: 4,
      with: {
        filmDirectors: { with: { director: true } },
        media: true,
      },
    }),
  ]);
  return {
    featured: lists[0] ?? null,
    lists: lists.slice(0, 4),
    recentFilms,
  };
}

/** poster → still → hero, for cards. */
export function posterOf(mediaRows: (typeof media.$inferSelect)[]) {
  const byKind = (kind: string) => mediaRows.find((m) => m.kind === kind);
  return byKind("poster") ?? byKind("still") ?? byKind("hero") ?? null;
}

/** hero → still → poster, for page tops. */
export function heroOf(mediaRows: (typeof media.$inferSelect)[]) {
  const byKind = (kind: string) => mediaRows.find((m) => m.kind === kind);
  return byKind("hero") ?? byKind("still") ?? byKind("poster") ?? null;
}
