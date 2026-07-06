import { pgEnum } from "drizzle-orm/pg-core";

export const contentStatus = pgEnum("content_status", ["draft", "published"]);

export const mediaKind = pgEnum("media_kind", [
  "poster",
  "still",
  "hero",
  "portrait",
  "other",
]);

export const markStatus = pgEnum("mark_status", ["watched", "want"]);
