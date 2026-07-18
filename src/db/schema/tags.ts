import { index, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { films } from "./films";
import { createdAt, primaryId, updatedAt } from "./helpers";

/**
 * Curated bilingual vocabulary (ADR 0014) — editors create tags in
 * /admin/tags; the film form only picks from them. Both names are NOT
 * NULL by design: that is the structural guarantee a chip can never
 * leak zh prose onto /en. No status columns — a tag has no page of its
 * own, so its visibility rides entirely on the films that carry it.
 */
export const tags = pgTable("tags", {
  id: primaryId(),
  slug: text().notNull().unique(),
  nameZh: text().notNull(),
  nameEn: text().notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** Unordered set (unlike film_directors) — display sorts by localized label. */
export const filmTags = pgTable(
  "film_tags",
  {
    filmId: text()
      .notNull()
      .references(() => films.id, { onDelete: "cascade" }),
    tagId: text()
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.filmId, t.tagId] }), index("film_tags_tag_idx").on(t.tagId)],
);
