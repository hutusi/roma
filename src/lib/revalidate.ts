import "server-only";
import { revalidatePath, updateTag } from "next/cache";

/**
 * Single map from entity → what must refresh on publish/update, so no
 * server action hand-rolls its own (and misses one). These helpers are
 * only ever called from server actions, which is why updateTag (instead
 * of revalidateTag) is allowed: it expires immediately, so an editor
 * sees their publish on the very next request. Tags cover data cached
 * with cacheTag/unstable_cache; paths cover the ISR'd pages.
 *
 * Both locales' paths are revalidated unconditionally: one row holds
 * both editions, so any edit can affect both pages, and revalidating a
 * never-built /en path is harmless — cheaper than a DB read to decide.
 * Tags stay locale-free for the same reason.
 */
export function revalidateFilm(slug: string) {
  updateTag(`film:${slug}`);
  updateTag("films");
  updateTag("home");
  for (const prefix of ["", "/en"]) {
    revalidatePath(`${prefix}/film/${slug}`);
    revalidatePath(`${prefix}/films`);
    revalidatePath(prefix === "" ? "/" : prefix);
  }
}

export function revalidateDirector(slug: string) {
  updateTag(`director:${slug}`);
  for (const prefix of ["", "/en"]) {
    revalidatePath(`${prefix}/director/${slug}`);
  }
}

export function revalidateList(slug: string) {
  updateTag(`list:${slug}`);
  updateTag("lists");
  updateTag("home");
  for (const prefix of ["", "/en"]) {
    revalidatePath(`${prefix}/list/${slug}`);
    revalidatePath(`${prefix}/lists`);
    revalidatePath(prefix === "" ? "/" : prefix);
  }
}
