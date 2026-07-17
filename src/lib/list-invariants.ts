import "server-only";
import { and, count, eq } from "drizzle-orm";
import type { DbTransaction } from "@/db/locks";
import { lockCuratedLists } from "@/db/locks";
import { curatedListItems, curatedLists, films } from "@/db/schema";

/** How many members the public list page can render. */
export async function publishedMemberCount(tx: DbTransaction, listId: string): Promise<number> {
  const [{ n }] = await tx
    .select({ n: count() })
    .from(curatedListItems)
    .innerJoin(films, eq(curatedListItems.filmId, films.id))
    .where(and(eq(curatedListItems.listId, listId), eq(films.status, "published")));
  return n;
}

export type UnpublishedList = { slug: string; wasPublic: boolean };

/**
 * Called inside the film-unpublish transaction after the film row is locked.
 * Locking every affected list makes publish/remove/unpublish one serialized
 * state transition and returns revalidation work for the caller to run only
 * after commit.
 */
export async function unpublishEmptiedLists(
  tx: DbTransaction,
  filmId: string,
): Promise<UnpublishedList[]> {
  // Lock EVERY list containing the film, not just currently-published
  // ones: this pre-lock read can't see a concurrent publishList that has
  // not committed yet, so filtering on status here would let a
  // just-published list escape the lock set and go live empty. The
  // status check runs below, on rows read under the lock — after any
  // in-flight publish has committed or been refused.
  const affected = await tx
    .select({ id: curatedLists.id })
    .from(curatedListItems)
    .innerJoin(curatedLists, eq(curatedListItems.listId, curatedLists.id))
    .where(eq(curatedListItems.filmId, filmId));
  const locked = await lockCuratedLists(
    tx,
    affected.map((list) => list.id),
  );

  const unpublished: UnpublishedList[] = [];
  for (const list of locked) {
    if (list.status === "published" && (await publishedMemberCount(tx, list.id)) === 0) {
      await tx.update(curatedLists).set({ status: "draft" }).where(eq(curatedLists.id, list.id));
      unpublished.push({ slug: list.slug, wasPublic: true });
    }
  }
  return unpublished;
}
