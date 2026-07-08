import { index, integer, jsonb, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { contentStatus } from "./enums";
import { films } from "./films";
import { createdAt, primaryId, updatedAt } from "./helpers";
import { media } from "./media";
import type { TiptapDoc } from "./types";

/**
 * 策展片单 — the core product. Editorial only; user lists are a separate,
 * deliberately lighter table.
 */
export const curatedLists = pgTable("curated_lists", {
  id: primaryId(),
  slug: text().notNull().unique(),
  title: text().notNull(),
  /** One-line tagline shown under the title. */
  theme: text(),
  /** Intro essay (Tiptap JSON). */
  intro: jsonb().$type<TiptapDoc>(),
  coverMediaId: text().references(() => media.id, { onDelete: "set null" }),
  status: contentStatus().notNull().default("draft"),
  publishedAt: timestamp({ withTimezone: true }),
  /** Deliberate ordering of the /lists index. */
  sortOrder: integer().notNull().default(0),
  createdBy: text().references(() => users.id, { onDelete: "set null" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const curatedListItems = pgTable(
  "curated_list_items",
  {
    id: primaryId(),
    listId: text()
      .notNull()
      .references(() => curatedLists.id, { onDelete: "cascade" }),
    filmId: text()
      .notNull()
      .references(() => films.id, { onDelete: "cascade" }),
    position: integer().notNull(),
    /** 入选理由 — per-film reasoning (Tiptap JSON). */
    reasoning: jsonb().$type<TiptapDoc>(),
  },
  (t) => [
    unique("curated_list_items_unique").on(t.listId, t.filmId),
    index("curated_list_items_list_idx").on(t.listId, t.position),
  ],
);
