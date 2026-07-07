"use server";

import { and, eq, max } from "drizzle-orm";
import { db } from "@/db";
import { userListItems, userLists } from "@/db/schema";
import { requireUser } from "@/lib/auth-guards";
import { fail, ok, type ActionResult } from "./result";

/** Every mutation first proves the list belongs to the caller. */
async function ownedList(listId: string) {
  const session = await requireUser();
  const list = await db.query.userLists.findFirst({
    where: eq(userLists.id, listId),
  });
  if (!list || list.userId !== session.user.id) return null;
  return list;
}

export async function createUserList(values: {
  title: string;
  description?: string;
}): Promise<ActionResult<{ id: string }>> {
  const session = await requireUser();
  const title = values.title.trim();
  if (!title) return fail("标题不能为空");
  if (title.length > 60) return fail("标题不能超过 60 字");
  const [created] = await db
    .insert(userLists)
    .values({
      userId: session.user.id,
      title,
      description: values.description?.trim() || null,
    })
    .returning({ id: userLists.id });
  return ok({ id: created.id });
}

export async function updateUserList(
  listId: string,
  values: { title: string; description?: string },
): Promise<ActionResult> {
  const list = await ownedList(listId);
  if (!list) return fail("片单不存在或无权限");
  const title = values.title.trim();
  if (!title) return fail("标题不能为空");
  await db
    .update(userLists)
    .set({ title, description: values.description?.trim() || null })
    .where(eq(userLists.id, listId));
  return ok();
}

export async function deleteUserList(listId: string): Promise<ActionResult> {
  const list = await ownedList(listId);
  if (!list) return fail("片单不存在或无权限");
  await db.delete(userLists).where(eq(userLists.id, listId));
  return ok();
}

export async function addFilmToUserList(
  listId: string,
  filmId: string,
): Promise<ActionResult> {
  const list = await ownedList(listId);
  if (!list) return fail("片单不存在或无权限");
  try {
    // max()+insert in one transaction so concurrent adds can't compute
    // the same position.
    await db.transaction(async (tx) => {
      const [{ maxPos }] = await tx
        .select({ maxPos: max(userListItems.position) })
        .from(userListItems)
        .where(eq(userListItems.listId, listId));
      await tx.insert(userListItems).values({
        listId,
        filmId,
        position: (maxPos ?? -1) + 1,
      });
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
    ) {
      return fail("这部影片已在片单中");
    }
    throw error;
  }
  return ok();
}

export async function removeUserListItem(
  listId: string,
  itemId: string,
): Promise<ActionResult> {
  const list = await ownedList(listId);
  if (!list) return fail("片单不存在或无权限");
  await db
    .delete(userListItems)
    .where(and(eq(userListItems.id, itemId), eq(userListItems.listId, listId)));
  return ok();
}

export async function reorderUserListItems(
  listId: string,
  orderedItemIds: string[],
): Promise<ActionResult> {
  const list = await ownedList(listId);
  if (!list) return fail("片单不存在或无权限");
  await db.transaction(async (tx) => {
    for (const [i, itemId] of orderedItemIds.entries()) {
      await tx
        .update(userListItems)
        .set({ position: i })
        .where(
          and(eq(userListItems.id, itemId), eq(userListItems.listId, listId)),
        );
    }
  });
  return ok();
}
