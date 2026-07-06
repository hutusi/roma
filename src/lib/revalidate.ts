import "server-only";
import { revalidatePath, updateTag } from "next/cache";

/**
 * Single map from entity → what must refresh on publish/update, so no
 * server action hand-rolls its own (and misses one). These helpers are
 * only ever called from server actions, which is why updateTag (instead
 * of revalidateTag) is allowed: it expires immediately, so an editor
 * sees their publish on the very next request. Tags cover data cached
 * with cacheTag/unstable_cache; paths cover the ISR'd pages.
 */
export function revalidateFilm(slug: string) {
  updateTag(`film:${slug}`);
  updateTag("films");
  updateTag("home");
  revalidatePath(`/film/${slug}`);
  revalidatePath("/films");
  revalidatePath("/");
}

export function revalidateDirector(slug: string) {
  updateTag(`director:${slug}`);
  revalidatePath(`/director/${slug}`);
}

export function revalidateList(slug: string) {
  updateTag(`list:${slug}`);
  updateTag("lists");
  updateTag("home");
  revalidatePath(`/list/${slug}`);
  revalidatePath("/lists");
  revalidatePath("/");
}
