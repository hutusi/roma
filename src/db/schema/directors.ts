import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { contentStatus } from "./enums";
import { createdAt, primaryId, updatedAt } from "./helpers";
import type { TiptapDoc } from "./types";

export const directors = pgTable("directors", {
  id: primaryId(),
  slug: text().notNull().unique(),
  /** Latin/original name, e.g. "Federico Fellini". */
  name: text().notNull(),
  nameZh: text(),
  /** Short plain-text bio for cards and metadata. */
  bio: text(),
  /** 创作历程 — long-form essay (Tiptap JSON). */
  careerEssay: jsonb().$type<TiptapDoc>(),
  bioEn: text(),
  careerEssayEn: jsonb().$type<TiptapDoc>(),
  status: contentStatus().notNull().default("draft"),
  /**
   * English edition on the same row; a director is en-visible only via
   * this flag (editorial call), never derived from their films.
   */
  statusEn: contentStatus().notNull().default("draft"),
  publishedAt: timestamp({ withTimezone: true }),
  publishedEnAt: timestamp({ withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
