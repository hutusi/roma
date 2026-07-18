import type { TiptapDoc } from "@/db/schema/types";

/**
 * Shapes for the editorial seed corpus. These are richer than the DB rows:
 * they carry seed-only wiring (director slug references, TMDB lookup hints)
 * that `seed-content.ts` resolves into ids and image rows before inserting.
 */

export type SeedDirector = {
  slug: string;
  /** Latin/original name, e.g. "Federico Fellini". */
  name: string;
  nameZh: string;
  /** Short plain-text bio (cards + metadata). */
  bio: string;
  /** 创作历程 — long-form essay. */
  careerEssay?: TiptapDoc;
  /** English edition; a seeded bioEn marks the director en-published. */
  bioEn?: string;
  careerEssayEn?: TiptapDoc;
  /** Optional explicit TMDB person id; otherwise resolved by name search. */
  tmdbPersonId?: number;
};

export type SeedCastMember = {
  name: string;
  zhName?: string;
  /** Latin/original role name (what /en shows). */
  character?: string;
  characterZh?: string;
};

export type SeedWatchLink = {
  platform: string;
  region: "CN" | "HK" | "TW" | "INTL";
  url?: string;
  note?: string;
  noteEn?: string;
};

export type SeedFilm = {
  slug: string;
  /** 大陆译名 — primary display title. */
  titleZh: string;
  /** 港译 */
  titleZhHk?: string;
  /** 台译 */
  titleZhTw?: string;
  titleOriginal: string;
  titleEn?: string;
  year: number;
  countries: string[];
  runtimeMinutes?: number;
  /** e.g. "1.37:1" */
  aspectRatio?: string;
  /** Defaults to true when omitted. */
  isBlackAndWhite?: boolean;
  /** 编辑札记 — plain text, must be 200–500 code points to publish. */
  editorialNote: string;
  essay?: TiptapDoc;
  /**
   * English edition — 120–350 words to publish; a seeded editorialNoteEn
   * (with titleEn) marks the film en-published.
   */
  editorialNoteEn?: string;
  essayEn?: TiptapDoc;
  cast?: SeedCastMember[];
  /** Director slugs, ordered (co-directors keep their order). */
  directorSlugs: string[];
  watchLinks?: SeedWatchLink[];
  /** Optional explicit TMDB movie id; otherwise resolved by title + year. */
  tmdbId?: number;
};

export type SeedListItem = {
  filmSlug: string;
  /** 入选理由 — per-film reasoning. */
  reasoning?: TiptapDoc;
  reasoningEn?: TiptapDoc;
};

export type SeedList = {
  slug: string;
  title: string;
  /** One-line tagline. */
  theme?: string;
  intro?: TiptapDoc;
  /** English edition; a seeded titleEn marks the list en-published. */
  titleEn?: string;
  themeEn?: string;
  introEn?: TiptapDoc;
  /** Lower sorts first; the list at 0 becomes the homepage featured list. */
  sortOrder: number;
  /** Film whose hero/poster image is reused as this list's cover. */
  coverFilmSlug?: string;
  items: SeedListItem[];
};
