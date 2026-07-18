import "server-only";
import { revalidatePath } from "next/cache";
import { pingIndexNow } from "@/lib/indexnow";
import { type PersonUrlRole, personPath } from "@/lib/routes";

/**
 * The single seam every editorial mutation invalidates through, so no
 * server action hand-rolls its own list (and misses one).
 *
 * It sweeps the whole public tree rather than mapping entity → pages.
 * The entity graph is densely cross-linked — a film's title rides on
 * person pages, list pages, film cards and the home page; a list's
 * membership rides on the film's "appears in" section; a director's name
 * rides on every film card — so an accurate per-entity map is most of the
 * read layer restated, and the previous attempt at one silently
 * under-invalidated on every one of those edges. The corpus is small and
 * edited rarely (ADR 0005), so re-rendering it costs less than the stale
 * pages the map leaked.
 *
 * Paths are the only mechanism available: ADR 0005 deliberately leaves
 * `cacheComponents` off in v1, so there is no `use cache`/`cacheTag`
 * anywhere to tag. Earlier revisions called `updateTag` here — those tags
 * had no readers and expired nothing.
 */
function revalidateEditorialPages() {
  // This app has no root layout — /[lang] and /admin are separate root
  // trees — so the "revalidate everything" form from the Next docs,
  // revalidatePath("/", "layout"), matches no layout file here. The
  // dynamic segment is why "layout" is required rather than optional.
  revalidatePath("/[lang]", "layout");
  // Reached by neither the sweep above (it sits outside the [lang] tree)
  // nor anything else — it had been frozen at build time since launch.
  revalidatePath("/sitemap.xml");
  // Route handlers are invalidated by their own path; a layout sweep
  // covers pages beneath it, not handlers.
  for (const prefix of ["/zh", "/en"]) revalidatePath(`${prefix}/rss.xml`);
}

/**
 * `notify` pings IndexNow, and is separate from invalidation because the
 * two answer different questions. Invalidation asks "could a cached page
 * be wrong?" — true even for a draft-only save, since drafts surface in
 * admin previews. Notification asks "is there a public URL worth
 * recrawling?" — false for a row that has never been published, where a
 * ping would hand a search engine the slug of unpublished work.
 *
 * So the caller's test is "does this row have, or did it have, a public
 * URL" — not "is this a big change". Unpublishing and deleting a
 * PUBLISHED row do notify: the URL now 404s, and a recrawl is how the
 * engine learns to drop it. Unpublishing or deleting a draft notifies
 * nothing, because there was never a URL to recrawl.
 *
 * Callers pass the row's PRE-mutation status; only the publish actions
 * pass a literal true, since the row is public after they run. Note
 * pingIndexNow pings both locales, and /en visibility requires zh
 * published (the subset rule), so the zh status is the whole test.
 */
type Options = { notify?: boolean };

export function revalidateFilm(slug: string, { notify = false }: Options = {}) {
  revalidateEditorialPages();
  if (notify) pingIndexNow([`/film/${slug}`, "/films", "/"]);
}

/** role picks the canonical segment IndexNow is pointed at. */
export function revalidatePerson(
  slug: string,
  role: PersonUrlRole,
  { notify = false }: Options = {},
) {
  revalidateEditorialPages();
  if (notify) pingIndexNow([personPath({ slug, primaryRole: role })]);
}

export function revalidateList(slug: string, { notify = false }: Options = {}) {
  revalidateEditorialPages();
  if (notify) pingIndexNow([`/list/${slug}`, "/lists", "/"]);
}

/**
 * Media has no public URL of its own — it renders inside film, person
 * and list pages — so it invalidates without ever notifying.
 */
export function revalidateMedia() {
  revalidateEditorialPages();
}

/**
 * Same shape as media: tags render as chips inside film pages and the
 * /films facet, never at a URL of their own, so a rename or delete
 * invalidates the tree without notifying (ADR 0014).
 */
export function revalidateTags() {
  revalidateEditorialPages();
}
