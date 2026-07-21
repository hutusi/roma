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
import { people } from "./people";
import type { TiptapDoc } from "./types";

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
    isBlackAndWhite: boolean().notNull().default(false),
    isSilent: boolean().notNull().default(false),
    /**
     * External identifiers, stored bare (never as URLs — URLs are built
     * only in src/lib/external-ids.ts). tmdbId doubles as the stable
     * handle for image/metadata re-import; wikidataId is sameAs-only.
     */
    tmdbId: integer().unique(),
    /** e.g. "tt0056801" */
    imdbId: text().unique(),
    /** Douban subject id, numeric string — e.g. "1291560" */
    doubanId: text().unique(),
    /** e.g. "Q550027" */
    wikidataId: text().unique(),
    /** 修复版本 — e.g. "2019 年 4K 修复，博洛尼亚电影资料馆". */
    restorationNote: text(),
    restorationNoteEn: text(),
    /**
     * 编辑札记 — plain text. Publishing requires 200–500 code points
     * (enforced in the app layer so CJK counts correctly); drafts may be
     * empty.
     */
    editorialNote: text(),
    /** Optional long-form essay (Tiptap JSON). */
    essay: jsonb().$type<TiptapDoc>(),
    /**
     * English edition of the editorial note. Publishing the English
     * edition requires 120–350 words (word-based, not code points).
     */
    editorialNoteEn: text(),
    essayEn: jsonb().$type<TiptapDoc>(),
    status: contentStatus().notNull().default("draft"),
    /**
     * English edition lives on the same row (house style: explicit
     * columns, not a locale table). en-visible ⇔ status AND statusEn
     * are both published, so /en can never show what zh doesn't.
     */
    statusEn: contentStatus().notNull().default("draft"),
    publishedAt: timestamp({ withTimezone: true }),
    publishedEnAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("films_status_idx").on(t.status),
    index("films_status_en_idx").on(t.statusEn),
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
      .references(() => people.id, { onDelete: "cascade" }),
    position: integer().notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.filmId, t.directorId] }),
    index("film_directors_director_idx").on(t.directorId),
  ],
);

/**
 * 演员表 — curated cast credits, one row per billing position. Name and
 * character are denormalized on the row so a credit stands on its own;
 * personId optionally links a curated person and degrades to the plain
 * credit (SET NULL) if that person is ever deleted.
 */
export const filmCast = pgTable(
  "film_cast",
  {
    id: primaryId(),
    filmId: text()
      .notNull()
      .references(() => films.id, { onDelete: "cascade" }),
    position: integer().notNull().default(0),
    /** Latin/original name, verbatim from curation. */
    name: text().notNull(),
    nameZh: text(),
    /**
     * Role name, split like name/nameZh (a character is a name, not
     * prose): character = Latin/original, what /en shows; /zh prefers
     * characterZh and falls back to character.
     */
    character: text(),
    characterZh: text(),
    personId: text().references(() => people.id, { onDelete: "set null" }),
  },
  (t) => [index("film_cast_film_idx").on(t.filmId), index("film_cast_person_idx").on(t.personId)],
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
    noteEn: text(),
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
      .references(() => people.id, { onDelete: "cascade" }),
    filmId: text()
      .notNull()
      .references(() => films.id, { onDelete: "restrict" }),
    position: integer().notNull(),
    note: text(),
    noteEn: text(),
  },
  (t) => [
    unique("director_viewing_unique").on(t.directorId, t.filmId),
    index("director_viewing_director_idx").on(t.directorId),
  ],
);
