import "server-only";
import { and, arrayContains, asc, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import {
  curatedListItems,
  curatedLists,
  directorViewingItems,
  filmCast,
  filmDirectors,
  films,
  filmWatchLinks,
  media,
  people,
} from "@/db/schema";
import type { Locale } from "@/i18n/locales";
import { visibleIn } from "./visibility";

/**
 * Nested relations come back in whatever order Postgres happens to
 * return unless asked, and posterOf/heroOf below take the first match —
 * so the schema's promise that "a film's poster is its first
 * kind='poster' row by sort_order" only held where a caller remembered
 * to sort, which was the detail pages and nothing else. Order at the
 * source so every read inherits it, rather than re-sorting per caller.
 * The id tiebreaker keeps equal sortOrder/position values stable instead
 * of merely narrowing the arbitrariness.
 */
const mediaOrder = [asc(media.sortOrder), asc(media.id)];
const creditOrder = [asc(filmDirectors.position), asc(filmDirectors.directorId)];

/** Film + the relations a card needs, ordered. */
const filmCardRelations = {
  filmDirectors: { with: { director: true as const }, orderBy: creditOrder },
  media: { orderBy: mediaOrder },
};

/**
 * Read layer for the public site and the admin draft preview. The
 * `*BySlug` functions only ever return published rows (public pages 404
 * on drafts); the `*ForPreview` functions fetch by id with no status
 * filter and sit behind requireEditor().
 *
 * The locale parameter carries the subset rule: en-visible ⇔ published
 * in zh AND en (so /en can never show what zh doesn't), and it must be
 * applied here — cached pages can't rely on request-time checks.
 */

const filmStatusConds = (locale: Locale) =>
  locale === "en"
    ? [eq(films.status, "published"), eq(films.statusEn, "published")]
    : [eq(films.status, "published")];

const filmDetailRelations = {
  ...filmCardRelations,
  cast: {
    // The person columns are the link gate: slug + status decide whether
    // a cast row renders as a link, and never leak prose.
    with: {
      person: {
        columns: {
          id: true,
          slug: true,
          name: true,
          nameZh: true,
          status: true,
          statusEn: true,
          primaryRole: true,
        },
      } as const,
    },
    orderBy: [asc(filmCast.position), asc(filmCast.id)],
  },
  watchLinks: { orderBy: [asc(filmWatchLinks.sortOrder), asc(filmWatchLinks.id)] },
  listItems: { with: { list: true as const } },
};

export async function getPublishedFilmBySlug(slug: string, locale: Locale = "zh") {
  const film = await db.query.films.findFirst({
    where: and(eq(films.slug, slug), ...filmStatusConds(locale)),
    with: filmDetailRelations,
  });
  if (!film) return null;
  return normalizeFilm(film, locale);
}

export async function getFilmForPreview(id: string, locale: Locale = "zh") {
  const film = await db.query.films.findFirst({
    where: eq(films.id, id),
    with: filmDetailRelations,
  });
  if (!film) return null;
  return normalizeFilm(film, locale);
}

/** Ordering is the query's job now; this only resolves the locale view. */
function normalizeFilm(
  film: NonNullable<Awaited<ReturnType<typeof rawFilm>>>,
  locale: Locale = "zh",
) {
  return {
    ...film,
    // "Appears in" — order by the lists' own editorial priority (sortOrder,
    // then slug) rather than junction-row order, so the section is stable
    // across requests.
    relatedLists: film.listItems
      .map((item) => item.list)
      .filter((list) => visibleIn(list, locale))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug)),
  };
}

// Only used to derive the relation-shaped type for normalizeFilm.
async function rawFilm() {
  return db.query.films.findFirst({ with: filmDetailRelations });
}

export type PublicFilm = NonNullable<Awaited<ReturnType<typeof getPublishedFilmBySlug>>>;

export async function getPublishedFilms(
  filters?: { decade?: number; country?: string },
  locale: Locale = "zh",
) {
  const conditions = filmStatusConds(locale);
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
    with: filmCardRelations,
  });
}

export type PublicFilmListItem = Awaited<ReturnType<typeof getPublishedFilms>>[number];

export async function getPublishedFilmSlugs(locale: Locale = "zh") {
  return db
    .select({ slug: films.slug, updatedAt: films.updatedAt })
    .from(films)
    .where(and(...filmStatusConds(locale)));
}

/** Most-recently-published films for the locale, newest first — feeds the RSS route. */
export async function getRecentPublishedFilms(locale: Locale = "zh", limit = 30) {
  return db.query.films.findMany({
    where: and(...filmStatusConds(locale)),
    orderBy: desc(locale === "en" ? films.publishedEnAt : films.publishedAt),
    limit,
    with: filmCardRelations,
  });
}

const personStatusConds = (locale: Locale) =>
  locale === "en"
    ? [eq(people.status, "published"), eq(people.statusEn, "published")]
    : [eq(people.status, "published")];

export async function getPublishedPersonBySlug(slug: string, locale: Locale = "zh") {
  const person = await db.query.people.findFirst({
    where: and(eq(people.slug, slug), ...personStatusConds(locale)),
    with: personRelations,
  });
  return person ? normalizePerson(person, locale) : null;
}

export async function getPersonForPreview(id: string, locale: Locale = "zh") {
  const person = await db.query.people.findFirst({
    where: eq(people.id, id),
    with: personRelations,
  });
  return person ? normalizePerson(person, locale) : null;
}

const personRelations = {
  viewingItems: {
    with: { film: true as const },
    orderBy: [asc(directorViewingItems.position), asc(directorViewingItems.id)],
  },
  filmDirectors: {
    with: { film: { with: { media: { orderBy: mediaOrder } } } },
    orderBy: creditOrder,
  },
  castCredits: {
    with: { film: true as const },
    orderBy: [asc(filmCast.position), asc(filmCast.id)],
  },
  media: { orderBy: mediaOrder },
};

function normalizePerson(
  person: NonNullable<Awaited<ReturnType<typeof rawPerson>>>,
  locale: Locale = "zh",
) {
  return {
    ...person,
    viewingItems: person.viewingItems.filter((item) => visibleIn(item.film, locale)),
    films: person.filmDirectors
      .map((fd) => fd.film)
      .filter((film) => visibleIn(film, locale))
      .sort((a, b) => a.year - b.year),
    // A film the person both directed and acted in appears in BOTH lists:
    // the acted-in row carries the character, which is the point.
    actedIn: person.castCredits
      .filter((credit) => visibleIn(credit.film, locale))
      .sort((a, b) => a.film.year - b.film.year),
  };
}

async function rawPerson() {
  return db.query.people.findFirst({ with: personRelations });
}

export type PublicPerson = NonNullable<Awaited<ReturnType<typeof getPublishedPersonBySlug>>>;

export async function getPublishedPersonSlugs(locale: Locale = "zh", role?: "director" | "actor") {
  const conds = personStatusConds(locale);
  if (role) conds.push(eq(people.primaryRole, role));
  return db
    .select({ slug: people.slug, updatedAt: people.updatedAt, primaryRole: people.primaryRole })
    .from(people)
    .where(and(...conds));
}

const listRelations = {
  items: {
    with: { film: { with: filmCardRelations } },
    orderBy: [asc(curatedListItems.position), asc(curatedListItems.id)],
  },
  cover: true as const,
};

const listStatusConds = (locale: Locale) =>
  locale === "en"
    ? [eq(curatedLists.status, "published"), eq(curatedLists.statusEn, "published")]
    : [eq(curatedLists.status, "published")];

export async function getPublishedListBySlug(slug: string, locale: Locale = "zh") {
  const list = await db.query.curatedLists.findFirst({
    where: and(eq(curatedLists.slug, slug), ...listStatusConds(locale)),
    with: listRelations,
  });
  // Items keep every zh-published member in both locales (顺序即立场);
  // the en renderer degrades untranslated members to unlinked entries.
  return list ? normalizeList(list, { publishedFilmsOnly: true }) : null;
}

export async function getListForPreview(id: string) {
  const list = await db.query.curatedLists.findFirst({
    where: eq(curatedLists.id, id),
    with: listRelations,
  });
  // Preview keeps draft films: editors need the full picture.
  return list ? normalizeList(list, { publishedFilmsOnly: false }) : null;
}

function normalizeList(
  list: NonNullable<Awaited<ReturnType<typeof rawList>>>,
  { publishedFilmsOnly }: { publishedFilmsOnly: boolean },
) {
  return {
    ...list,
    items: list.items.filter((item) => !publishedFilmsOnly || item.film.status === "published"),
  };
}

async function rawList() {
  return db.query.curatedLists.findFirst({ with: listRelations });
}

export type PublicList = NonNullable<Awaited<ReturnType<typeof getPublishedListBySlug>>>;

export async function getPublishedLists(locale: Locale = "zh") {
  const lists = await db.query.curatedLists.findMany({
    where: and(...listStatusConds(locale)),
    orderBy: [asc(curatedLists.sortOrder), desc(curatedLists.publishedAt)],
    with: {
      items: {
        columns: { id: true },
        with: { film: { columns: { status: true } } },
      },
      cover: true,
    },
  });
  // Draft films don't render on list pages, so don't count them either.
  return lists.map((list) => ({
    ...list,
    items: list.items.filter((item) => item.film.status === "published"),
  }));
}

export type PublicListSummary = Awaited<ReturnType<typeof getPublishedLists>>[number];

export async function getPublishedListSlugs(locale: Locale = "zh") {
  return db
    .select({ slug: curatedLists.slug, updatedAt: curatedLists.updatedAt })
    .from(curatedLists)
    .where(and(...listStatusConds(locale)));
}

export async function getHomeData(locale: Locale = "zh") {
  const [lists, recentFilms] = await Promise.all([
    getPublishedLists(locale),
    getRecentPublishedFilms(locale, 4),
  ]);
  return {
    featured: lists[0] ?? null,
    lists: lists.slice(0, 4),
    recentFilms,
  };
}

/**
 * Minimal-column fetchers for the /en translation-pending stubs
 * (ADR 0012): zh-published entities whose English edition isn't out
 * yet resolve to a stub instead of a 404. The `columns` allowlists are
 * the enforcement mechanism for "no zh prose on /en" — a stub can't
 * leak what its query never selects. The listing/sitemap/RSS subset
 * rule is untouched: these are only reached from a detail URL.
 */
export async function getFilmStubBySlug(slug: string) {
  const film = await db.query.films.findFirst({
    columns: { slug: true, titleEn: true, titleOriginal: true, year: true },
    where: and(eq(films.slug, slug), eq(films.status, "published")),
  });
  return film ?? null;
}

export async function getPersonStubBySlug(slug: string) {
  const person = await db.query.people.findFirst({
    // primaryRole is not prose — the stub needs it to resolve its
    // canonical segment (and 308 away from the other one).
    columns: { slug: true, name: true, primaryRole: true },
    where: and(eq(people.slug, slug), eq(people.status, "published")),
  });
  return person ?? null;
}

export async function getListStubBySlug(slug: string) {
  const list = await db.query.curatedLists.findFirst({
    // `title` is the zh list title — a proper noun, shown on the stub
    // heading only when titleEn is missing (ADR 0012 records this
    // exemption from the no-zh-prose rule).
    columns: { slug: true, titleEn: true, title: true },
    where: and(eq(curatedLists.slug, slug), eq(curatedLists.status, "published")),
  });
  return list ?? null;
}

/**
 * poster → still → hero, for cards.
 *
 * Takes the FIRST row of the preferred kind, so it inherits its caller's
 * order and only satisfies the schema's "first by sort_order" promise
 * when handed rows this module ordered. Feed it a relation loaded
 * anywhere else and the choice is arbitrary — which is exactly what used
 * to happen on every list and card.
 */
export function posterOf(mediaRows: (typeof media.$inferSelect)[]) {
  const byKind = (kind: string) => mediaRows.find((m) => m.kind === kind);
  return byKind("poster") ?? byKind("still") ?? byKind("hero") ?? null;
}

/** hero → still → poster, for page tops. */
export function heroOf(mediaRows: (typeof media.$inferSelect)[]) {
  const byKind = (kind: string) => mediaRows.find((m) => m.kind === kind);
  return byKind("hero") ?? byKind("still") ?? byKind("poster") ?? null;
}
