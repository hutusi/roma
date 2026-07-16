"use server";

import { and, eq, max } from "drizzle-orm";
import { db } from "@/db";
import { userListItems, userLists } from "@/db/schema";
import type { Locale } from "@/i18n/locales";
import { requireUser } from "@/lib/auth-guards";
import { permutationProblem } from "@/lib/validators/ordering";
import { type ActionResult, fail, ok } from "./result";

/**
 * These actions return a stable error CODE (not prose) as `error`; the
 * calling client island maps it to a localized message via its `labels`,
 * since the same action serves both the zh and /en user areas. The island
 * also passes its `locale` so an expired-session redirect (from requireUser)
 * lands on the in-locale sign-in — the /en/u/* profile routes are public, so
 * this action guard is their only auth boundary.
 */

/**
 * Both limits mirror the inputs' maxLength. maxLength is a client hint —
 * these actions are public endpoints, and title was already checked here
 * while description was not, so only description could arrive unbounded.
 */
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 140;

/** Every mutation first proves the list belongs to the caller. */
async function ownedList(listId: string, locale: Locale) {
  const session = await requireUser(locale);
  const list = await db.query.userLists.findFirst({
    where: eq(userLists.id, listId),
  });
  if (!list || list.userId !== session.user.id) return null;
  return list;
}

export async function createUserList(
  values: { title: string; description?: string },
  locale: Locale = "zh",
): Promise<ActionResult<{ id: string }>> {
  const session = await requireUser(locale);
  const title = values.title.trim();
  const description = values.description?.trim() || null;
  if (!title) return fail("titleRequired");
  if (title.length > TITLE_MAX) return fail("titleTooLong");
  if (description && description.length > DESCRIPTION_MAX) return fail("descriptionTooLong");
  const [created] = await db
    .insert(userLists)
    .values({
      userId: session.user.id,
      title,
      description,
    })
    .returning({ id: userLists.id });
  return ok({ id: created.id });
}

export async function updateUserList(
  listId: string,
  values: { title: string; description?: string },
  locale: Locale = "zh",
): Promise<ActionResult> {
  const list = await ownedList(listId, locale);
  if (!list) return fail("notFound");
  const title = values.title.trim();
  const description = values.description?.trim() || null;
  if (!title) return fail("titleRequired");
  if (title.length > TITLE_MAX) return fail("titleTooLong");
  if (description && description.length > DESCRIPTION_MAX) return fail("descriptionTooLong");
  await db.update(userLists).set({ title, description }).where(eq(userLists.id, listId));
  return ok();
}

export async function deleteUserList(listId: string, locale: Locale = "zh"): Promise<ActionResult> {
  const list = await ownedList(listId, locale);
  if (!list) return fail("notFound");
  await db.delete(userLists).where(eq(userLists.id, listId));
  return ok();
}

export async function addFilmToUserList(
  listId: string,
  filmId: string,
  locale: Locale = "zh",
): Promise<ActionResult> {
  const list = await ownedList(listId, locale);
  if (!list) return fail("notFound");
  try {
    // The transaction makes the read and the insert atomic, but NOT
    // mutually exclusive: under READ COMMITTED (the default here) two
    // concurrent adds both see the same max() — neither sees the other's
    // uncommitted row — and both write maxPos + 1. Nothing enforces
    // unique positions, so the duplicates land and the two items tie.
    // Accepted rather than fixed: serializing this needs SERIALIZABLE or
    // an advisory lock plus a unique (list_id, position) constraint and a
    // backfill, which is a lot of machinery for a per-user list where
    // the tie only costs an arbitrary order between two items.
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
      return fail("alreadyInList");
    }
    throw error;
  }
  return ok();
}

export async function removeUserListItem(
  listId: string,
  itemId: string,
  locale: Locale = "zh",
): Promise<ActionResult> {
  const list = await ownedList(listId, locale);
  if (!list) return fail("notFound");
  await db
    .delete(userListItems)
    .where(and(eq(userListItems.id, itemId), eq(userListItems.listId, listId)));
  return ok();
}

export async function reorderUserListItems(
  listId: string,
  orderedItemIds: string[],
  locale: Locale = "zh",
): Promise<ActionResult> {
  const list = await ownedList(listId, locale);
  if (!list) return fail("notFound");
  const current = await db
    .select({ id: userListItems.id })
    .from(userListItems)
    .where(eq(userListItems.listId, listId));
  if (
    permutationProblem(
      orderedItemIds,
      current.map((i) => i.id),
    )
  )
    return fail("reorderInvalid");
  await db.transaction(async (tx) => {
    for (const [i, itemId] of orderedItemIds.entries()) {
      await tx
        .update(userListItems)
        .set({ position: i })
        .where(and(eq(userListItems.id, itemId), eq(userListItems.listId, listId)));
    }
  });
  return ok();
}
