import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, text } from "drizzle-orm/pg-core";
import { mediaKind } from "./enums";
import { films } from "./films";
import { createdAt, primaryId } from "./helpers";
import { people } from "./people";

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
    credit: text().notNull(),
    width: integer(),
    height: integer(),
    /**
     * The image's dominant colour (#rrggbb), measured at upload. Frames
     * paint it while the image loads, so a grid of lazy posters reads as
     * muted colour fields instead of black slabs. NULL for rows uploaded
     * before it existed until `bun run backfill:colors` fills them.
     */
    dominantColor: text(),
    kind: mediaKind().notNull().default("still"),
    filmId: text().references(() => films.id, { onDelete: "set null" }),
    /** Image of this person (portrait etc.) — a person link, not a credit. */
    personId: text().references(() => people.id, { onDelete: "set null" }),
    sortOrder: integer().notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [
    index("media_film_idx").on(t.filmId),
    index("media_person_idx").on(t.personId),
    check("media_credit_nonblank", sql`length(btrim(${t.credit})) > 0`),
    check("media_dominant_color_hex", sql`${t.dominantColor} ~ '^#[0-9a-f]{6}$'`),
  ],
);
