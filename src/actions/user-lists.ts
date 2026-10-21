"use server";

import { and, count, eq, max, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { type DbTransaction, lockFilm, lockUserList } from "@/db/locks";
import { userListItems, userLists } from "@/db/schema";
import { requireUserResult } from "@/lib/auth-guards";
import { rowId, userListText } from "@/lib/validators/action-input";
import { permutationProblem } from "@/lib/validators/ordering";
import {
  type ActionResult,
  fail,
  failWith,
  isForeignKeyViolation,
  isUniqueViolation,
  ok,
} from "./result";

/*
 * Errors are codes the UI maps to its own copy (userList.errors in the
 * dictionaries). The guards return "sessionExpired" instead of
 * redirecting, so an owner mid-edit keeps what they typed.
 */

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 140;
/** Generous for a reader's own lists; it bounds abuse, not use. */
const LISTS_PER_USER_MAX = 100;
const ITEMS_PER_LIST_MAX = 500;

function validatedText(
  values: unknown,
): { title: string; description: string | null } | { error: string } {
  const parsed = userListText.safeParse(values);
  if (!parsed.success) return { error: "invalid" };
  const title = parsed.data.title.trim();
  const description = parsed.data.description?.trim() || null;
  if (!title) return { error: "titleRequired" };
  if (title.length > TITLE_MAX) return { error: "titleTooLong" };
  if (description && description.length > DESCRIPTION_MAX) return { error: "descriptionTooLong" };
  return { title, description };
}

const validId = (id: unknown) => rowId.safeParse(id).success;

async function lockedOwnedList(tx: DbTransaction, listId: string, userId: string) {
  const list = await lockUserList(tx, listId);
  return list?.userId === userId ? list : null;
}

export async function createUserList(values: {
  title: string;
  description?: string;
}): Promise<ActionResult<{ id: string }>> {
  const guarded = await requireUserResult();
  if (!guarded.ok) return fail(guarded.error);
  const parsed = validatedText(values);
  if ("error" in parsed) return fail(parsed.error);
  const userId = guarded.session.user.id;
  try {
    const [{ lists }] = await db
      .select({ lists: count() })
      .from(userLists)
      .where(eq(userLists.userId, userId));
    if (lists >= LISTS_PER_USER_MAX) return fail("tooManyLists");
    const [created] = await db
      .insert(userLists)
      .values({ userId, ...parsed })
      .returning({ id: userLists.id });
    return ok({ id: created.id });
  } catch (error) {
    return failWith("unknown", error, "createUserList");
  }
}

export async function updateUserList(
  listId: string,
  values: { title: string; description?: string },
): Promise<ActionResult> {
  const guarded = await requireUserResult();
  if (!guarded.ok) return fail(guarded.error);
  if (!validId(listId)) return fail("notFound");
  const parsed = validatedText(values);
  if ("error" in parsed) return fail(parsed.error);
  const session = guarded.session;
  const updated = await db.transaction(async (tx) => {
    const list = await lockedOwnedList(tx, listId, session.user.id);
    if (!list) return false;
    await tx.update(userLists).set(parsed).where(eq(userLists.id, listId));
    return true;
  });
  return updated ? ok() : fail("notFound");
}

export async function deleteUserList(listId: string): Promise<ActionResult> {
  const guarded = await requireUserResult();
  if (!guarded.ok) return fail(guarded.error);
  if (!validId(listId)) return fail("notFound");
  const session = guarded.session;
  const deleted = await db.transaction(async (tx) => {
    const list = await lockedOwnedList(tx, listId, session.user.id);
    if (!list) return false;
    await tx.delete(userLists).where(eq(userLists.id, listId));
    return true;
  });
  return deleted ? ok() : fail("notFound");
}

export async function addFilmToUserList(listId: string, filmId: string): Promise<ActionResult> {
  const guarded = await requireUserResult();
  if (!guarded.ok) return fail(guarded.error);
  if (!validId(listId) || !validId(filmId)) return fail("notFound");
  const session = guarded.session;
  try {
    const outcome = await db.transaction(async (tx) => {
      // Only published films: a draft id is as good as unknown to a reader.
      const film = await lockFilm(tx, filmId);
      if (film?.status !== "published") return "notFound";
      const list = await lockedOwnedList(tx, listId, session.user.id);
      if (!list) return "notFound";
      const [{ maxPos, items }] = await tx
        .select({ maxPos: max(userListItems.position), items: count() })
        .from(userListItems)
        .where(eq(userListItems.listId, listId));
      if (items >= ITEMS_PER_LIST_MAX) return "listFull";
      await tx.insert(userListItems).values({
        listId,
        filmId,
        position: (maxPos ?? -1) + 1,
      });
      return null;
    });
    return outcome ? fail(outcome) : ok();
  } catch (error) {
    if (isUniqueViolation(error)) return fail("alreadyInList");
    if (isForeignKeyViolation(error)) return fail("notFound");
    return failWith("unknown", error, "addFilmToUserList");
  }
}

export async function removeUserListItem(listId: string, itemId: string): Promise<ActionResult> {
  const guarded = await requireUserResult();
  if (!guarded.ok) return fail(guarded.error);
  if (!validId(listId) || !validId(itemId)) return fail("notFound");
  const session = guarded.session;
  const outcome = await db.transaction(async (tx) => {
    const list = await lockedOwnedList(tx, listId, session.user.id);
    if (!list) return "notFound";
    const deleted = await tx
      .delete(userListItems)
      .where(and(eq(userListItems.id, itemId), eq(userListItems.listId, listId)))
      .returning({ id: userListItems.id });
    return deleted.length ? null : "notFound";
  });
  return outcome ? fail(outcome) : ok();
}

async function movePositionsOutOfRange(
  tx: DbTransaction,
  listId: string,
  currentMax: number | null,
) {
  if (currentMax === null) return;
  await tx
    .update(userListItems)
    .set({ position: sql`${userListItems.position} + ${currentMax + 1}` })
    .where(eq(userListItems.listId, listId));
}

export async function reorderUserListItems(
  listId: string,
  orderedItemIds: string[],
): Promise<ActionResult> {
  const guarded = await requireUserResult();
  if (!guarded.ok) return fail(guarded.error);
  if (!validId(listId)) return fail("notFound");
  if (!z.array(rowId).max(ITEMS_PER_LIST_MAX).safeParse(orderedItemIds).success) {
    return fail("reorderInvalid");
  }
  const session = guarded.session;
  const outcome = await db.transaction(async (tx) => {
    const list = await lockedOwnedList(tx, listId, session.user.id);
    if (!list) return "notFound";
    const current = await tx
      .select({ id: userListItems.id, position: userListItems.position })
      .from(userListItems)
      .where(eq(userListItems.listId, listId));
    if (
      permutationProblem(
        orderedItemIds,
        current.map((item) => item.id),
      )
    ) {
      return "reorderInvalid";
    }
    await movePositionsOutOfRange(
      tx,
      listId,
      current.length ? Math.max(...current.map((item) => item.position)) : null,
    );
    for (const [position, itemId] of orderedItemIds.entries()) {
      await tx
        .update(userListItems)
        .set({ position })
        .where(and(eq(userListItems.id, itemId), eq(userListItems.listId, listId)));
    }
    return null;
  });
  return outcome ? fail(outcome) : ok();
}
