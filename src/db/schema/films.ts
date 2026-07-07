import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { contentStatus } from "./enums";
import { createdAt, primaryId, updatedAt } from "./helpers";
import { directors } from "./directors";
import type { CastMember, TiptapDoc } from "./types";

export const films = pgTable(
  "films",
  {
    id: primaryId(),
    slug: text().notNull().unique(),
    /** 大陆译名 — the primary display title. */
    titleZh: text().notNull(),
    /** 港译 */
    titleZhHk: text(),
    /** 台译 */
    titleZhTw: text(),
    titleOriginal: text().notNull(),
    titleEn: text(),
    year: integer().notNull(),
    countries: text().array().notNull().default([]),
    runtimeMinutes: integer(),
    /** e.g. "1.37:1" */
    aspectRatio: text(),
    isBlackAndWhite: boolean().notNull().default(true),
    /**
     * 编辑札记 — plain text. Publishing requires 200–500 code points
     * (enforced in the app layer so CJK counts correctly); drafts may be
     * empty.
     */
    editorialNote: text(),
    /** Optional long-form essay (Tiptap JSON). */
    essay: jsonb().$type<TiptapDoc>(),
    castJson: jsonb().$type<CastMember[]>(),
    status: contentStatus().notNull().default("draft"),
    publishedAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("films_status_idx").on(t.status),
    index("films_year_idx").on(t.year),
  ],
);

/** Junction rather than a single FK: co-directed classics exist. */
export const filmDirectors = pgTable(
  "film_directors",
  {
    filmId: text()
      .notNull()
      .references(() => films.id, { onDelete: "cascade" }),
    directorId: text()
      .notNull()
      .references(() => directors.id, { onDelete: "cascade" }),
    position: integer().notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.filmId, t.directorId] }),
    index("film_directors_director_idx").on(t.directorId),
  ],
);

/** 哪里能看 — manually maintained, one row per platform/region. */
export const filmWatchLinks = pgTable(
  "film_watch_links",
  {
    id: primaryId(),
    filmId: text()
      .notNull()
      .references(() => films.id, { onDelete: "cascade" }),
    platform: text().notNull(),
    /** 'CN' | 'HK' | 'TW' | 'INTL' — kept as text; editors curate it. */
    region: text().notNull(),
    url: text(),
    note: text(),
    sortOrder: integer().notNull().default(0),
  },
  (t) => [index("film_watch_links_film_idx").on(t.filmId)],
);

/**
 * 建议观看顺序 — an ordered, annotated path through a director's films.
 * Lives here (not in directors.ts) to keep schema imports acyclic.
 */
export const directorViewingItems = pgTable(
  "director_viewing_items",
  {
    id: primaryId(),
    directorId: text()
      .notNull()
      .references(() => directors.id, { onDelete: "cascade" }),
    filmId: text()
      .notNull()
      .references(() => films.id, { onDelete: "cascade" }),
    position: integer().notNull(),
    note: text(),
  },
  (t) => [
    unique("director_viewing_unique").on(t.directorId, t.filmId),
    index("director_viewing_director_idx").on(t.directorId),
  ],
);
