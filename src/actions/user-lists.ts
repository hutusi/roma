"use server";

import { and, eq, max, sql } from "drizzle-orm";
import { db } from "@/db";
import { type DbTransaction, lockFilm, lockUserList } from "@/db/locks";
import { userListItems, userLists } from "@/db/schema";
import type { Locale } from "@/i18n/locales";
import { requireUser } from "@/lib/auth-guards";
import { permutationProblem } from "@/lib/validators/ordering";
import { type ActionResult, fail, ok } from "./result";

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 140;

function validatedText(values: {
  title: string;
  description?: string;
}): { title: string; description: string | null } | { error: string } {
  const title = values.title.trim();
  const description = values.description?.trim() || null;
  if (!title) return { error: "titleRequired" };
  if (title.length > TITLE_MAX) return { error: "titleTooLong" };
  if (description && description.length > DESCRIPTION_MAX) return { error: "descriptionTooLong" };
  return { title, description };
}

async function lockedOwnedList(tx: DbTransaction, listId: string, userId: string) {
  const list = await lockUserList(tx, listId);
  return list?.userId === userId ? list : null;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export async function createUserList(
  values: { title: string; description?: string },
  locale: Locale = "zh",
): Promise<ActionResult<{ id: string }>> {
  const session = await requireUser(locale);
  const parsed = validatedText(values);
  if ("error" in parsed) return fail(parsed.error);
  const [created] = await db
    .insert(userLists)
    .values({ userId: session.user.id, ...parsed })
    .returning({ id: userLists.id });
  return ok({ id: created.id });
}

export async function updateUserList(
  listId: string,
  values: { title: string; description?: string },
  locale: Locale = "zh",
): Promise<ActionResult> {
  const session = await requireUser(locale);
  const parsed = validatedText(values);
  if ("error" in parsed) return fail(parsed.error);
  const updated = await db.transaction(async (tx) => {
    const list = await lockedOwnedList(tx, listId, session.user.id);
    if (!list) return false;
    await tx.update(userLists).set(parsed).where(eq(userLists.id, listId));
    return true;
  });
  return updated ? ok() : fail("notFound");
}

export async function deleteUserList(listId: string, locale: Locale = "zh"): Promise<ActionResult> {
  const session = await requireUser(locale);
  const deleted = await db.transaction(async (tx) => {
    const list = await lockedOwnedList(tx, listId, session.user.id);
    if (!list) return false;
    await tx.delete(userLists).where(eq(userLists.id, listId));
    return true;
  });
  return deleted ? ok() : fail("notFound");
}

export async function addFilmToUserList(
  listId: string,
  filmId: string,
  locale: Locale = "zh",
): Promise<ActionResult> {
  const session = await requireUser(locale);
  try {
    const outcome = await db.transaction(async (tx) => {
      const film = await lockFilm(tx, filmId);
      if (!film) return "notFound";
      const list = await lockedOwnedList(tx, listId, session.user.id);
      if (!list) return "notFound";
      const [{ maxPos }] = await tx
        .select({ maxPos: max(userListItems.position) })
        .from(userListItems)
        .where(eq(userListItems.listId, listId));
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
    throw error;
  }
}

export async function removeUserListItem(
  listId: string,
  itemId: string,
  locale: Locale = "zh",
): Promise<ActionResult> {
  const session = await requireUser(locale);
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
  locale: Locale = "zh",
): Promise<ActionResult> {
  const session = await requireUser(locale);
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
