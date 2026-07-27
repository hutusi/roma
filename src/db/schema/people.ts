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
  /**
   * 人物介绍 — short plain-text introduction, neutral and encyclopedic.
   * Doubles as the card blurb and the meta description (sliced to 160),
   * which is why it stays short rather than growing into the body text;
   * 创作历程 is where length belongs.
   */
  bio: text(),
  /** 创作历程 — long-form essay (Tiptap JSON). */
  careerEssay: jsonb().$type<TiptapDoc>(),
  bioEn: text(),
  careerEssayEn: jsonb().$type<TiptapDoc>(),
  /**
   * 编辑札记 — the editorial position in an editor's own voice, optional
   * and capped rather than floored, exactly as on films. A person
   * publishes on their introduction alone.
   */
  editorialNote: text(),
  editorialNoteEn: text(),
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
