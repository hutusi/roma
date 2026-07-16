import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, primaryKey, text, unique } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./auth";
import { markStatus } from "./enums";
import { films } from "./films";
import { createdAt, primaryId, updatedAt } from "./helpers";
import { curatedLists } from "./lists";

/**
 * 看过 / 想看 — one row per user+film; marking one status overwrites the
 * other (upsert on the composite PK).
 */
export const userMarks = pgTable(
  "user_marks",
  {
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    filmId: text()
      .notNull()
      .references(() => films.id, { onDelete: "restrict" }),
    status: markStatus().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.filmId] }), index("user_marks_film_idx").on(t.filmId)],
);

/**
 * User lists are intentionally lighter than curated lists: title, short
 * description, ordered films. The 12-char id doubles as the public URL
 * segment, so users never manage slugs.
 */
export const userLists = pgTable(
  "user_lists",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid(12)),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text().notNull(),
    description: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("user_lists_user_idx").on(t.userId)],
);

export const userListItems = pgTable(
  "user_list_items",
  {
    id: primaryId(),
    listId: text()
      .notNull()
      .references(() => userLists.id, { onDelete: "cascade" }),
    filmId: text()
      .notNull()
      .references(() => films.id, { onDelete: "restrict" }),
    position: integer().notNull(),
  },
  (t) => [
    unique("user_list_items_unique").on(t.listId, t.filmId),
    unique("user_list_items_position_unique").on(t.listId, t.position),
    check("user_list_items_position_nonnegative", sql`${t.position} >= 0`),
  ],
);

export const listFollows = pgTable(
  "list_follows",
  {
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listId: text()
      .notNull()
      .references(() => curatedLists.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.listId] }),
    index("list_follows_list_idx").on(t.listId),
  ],
);
