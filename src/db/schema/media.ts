import { index, integer, pgTable, text } from "drizzle-orm/pg-core";
import { mediaKind } from "./enums";
import { createdAt, primaryId } from "./helpers";
import { films } from "./films";
import { directors } from "./directors";

/**
 * Uploaded images (Vercel Blob). A film's poster is its first
 * kind='poster' row by sort_order — no back-reference column on films,
 * which would create a circular FK and complicate migrations.
 */
export const media = pgTable(
  "media",
  {
    id: primaryId(),
    /** Public Blob URL. */
    url: text().notNull(),
    /** Blob pathname, required to delete the blob later. */
    pathname: text().notNull(),
    alt: text(),
    /** Source attribution — always filled; stills carry licensing risk. */
    credit: text(),
    width: integer(),
    height: integer(),
    kind: mediaKind().notNull().default("still"),
    filmId: text().references(() => films.id, { onDelete: "set null" }),
    directorId: text().references(() => directors.id, {
      onDelete: "set null",
    }),
    sortOrder: integer().notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [
    index("media_film_idx").on(t.filmId),
    index("media_director_idx").on(t.directorId),
  ],
);
