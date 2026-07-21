import { pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "./helpers";

/**
 * What `seed-data` asserted at the last successful `db:seed:content` run.
 *
 * Without this, the seeder has only two inputs — what seed-data says now,
 * and what the database holds — and those two cannot distinguish "this
 * release adds a tag" from "an editor removed one". They look identical.
 * Every workaround this replaces (an explicit --create-tags list, an
 * explicit --films list, a first-run gate, a drift warning the operator
 * had to interpret) existed to make a human supply the missing third
 * input.
 *
 * Recording it makes the comparison a three-way merge, the same shape git
 * uses for a file: baseline / seed-data / database. See ADR 0014.
 *
 * Keyed by SLUG, with no foreign keys, deliberately. The baseline has to
 * outlive the row it describes: a tag deleted in /admin and recreated
 * later is the same tag to seed-data, and a cascade would erase precisely
 * the record that proves an editor removed it — which is the one fact
 * these tables exist to keep.
 */

/** Tag slugs seed-data has previously asked for. */
export const seedTagBaseline = pgTable("seed_tag_baseline", {
  slug: text().primaryKey(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** (film, tag) assignments seed-data has previously asked for. */
export const seedFilmTagBaseline = pgTable(
  "seed_film_tag_baseline",
  {
    filmSlug: text().notNull(),
    tagSlug: text().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [primaryKey({ columns: [t.filmSlug, t.tagSlug] })],
);
