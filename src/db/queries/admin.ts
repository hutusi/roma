import "server-only";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";

/** How many recent uploads the essay editor's image picker offers. */
export const EDITOR_MEDIA_LIMIT = 200;

/**
 * The media library as the essay editor's image picker sees it: newest
 * first, with what the picker searches (alt, credit, file name in the
 * URL) and shows. Was repeated inline on all six editor pages.
 */
export function getEditorMedia() {
  return db
    .select({ id: media.id, url: media.url, alt: media.alt, credit: media.credit })
    .from(media)
    .orderBy(desc(media.createdAt))
    .limit(EDITOR_MEDIA_LIMIT);
}
