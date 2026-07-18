import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { contentStatus, personRole } from "./enums";
import { createdAt, primaryId, updatedAt } from "./helpers";
import type { TiptapDoc } from "./types";

/** Curated people — directors and actors alike; one row per human. */
export const people = pgTable("people", {
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
  /**
   * Editorial primary role; picks the canonical URL segment
   * (/director vs /actor). Credits, not this flag, decide which
   * filmography sections a person page shows.
   */
  primaryRole: personRole().notNull().default("director"),
  status: contentStatus().notNull().default("draft"),
  /**
   * English edition on the same row; a person is en-visible only via
   * this flag (editorial call), never derived from their films.
   */
  statusEn: contentStatus().notNull().default("draft"),
  publishedAt: timestamp({ withTimezone: true }),
  publishedEnAt: timestamp({ withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
