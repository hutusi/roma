import "server-only";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { curatedListItems, curatedLists, films } from "@/db/schema";
import { revalidateList } from "@/lib/revalidate";

/**
 * The invariant a published curated list must hold: at least one member
 * film is itself published. publishList enforces it at publish time; this
 * module guards the mutations that could later break it — item removal
 * (in lists.ts) and film unpublish (in films.ts).
 *
 * These are plain server-side helpers, deliberately NOT in a "use server"
 * module: every export of one becomes a public RPC endpoint, and an
 * unguarded unpublishEmptiedLists would let anyone unpublish lists. They
 * run only inside already-guarded actions.
 */

/**
 * How many of a list's members are published — i.e. how many the public
 * list page actually renders (it strips draft members).
 */
export async function publishedMemberCount(listId: string): Promise<number> {
  const [{ n }] = await db
    .select({ n: count() })
    .from(curatedListItems)
    .innerJoin(films, eq(curatedListItems.filmId, films.id))
    .where(and(eq(curatedListItems.listId, listId), eq(films.status, "published")));
  return n;
}

/**
 * After a film is unpublished, auto-unpublish any published curated list
 * this leaves with zero published members — the public page would
 * otherwise render a bare <ol>. Auto-unpublish rather than blocking the
 * film edit is the right coupling: a film belongs to many lists, and the
 * editor's action was about the film, not the list. Call AFTER the film's
 * status flip so the count reflects it.
 */
export async function unpublishEmptiedLists(filmId: string): Promise<void> {
  const rows = await db
    .select({ id: curatedLists.id, slug: curatedLists.slug })
    .from(curatedListItems)
    .innerJoin(curatedLists, eq(curatedListItems.listId, curatedLists.id))
    .where(and(eq(curatedListItems.filmId, filmId), eq(curatedLists.status, "published")));
  for (const list of rows) {
    if ((await publishedMemberCount(list.id)) === 0) {
      await db.update(curatedLists).set({ status: "draft" }).where(eq(curatedLists.id, list.id));
      revalidateList(list.slug, { notify: true });
    }
  }
}
