"use server";

import { and, count, eq, max } from "drizzle-orm";
import { db } from "@/db";
import { curatedListItems, curatedLists } from "@/db/schema";
import type { TiptapDoc } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { revalidateList } from "@/lib/revalidate";
import { listFormSchema, type ListFormValues } from "@/lib/validators/list";
import { fail, ok, type ActionResult } from "./result";

async function listSlug(listId: string): Promise<string | null> {
  const list = await db.query.curatedLists.findFirst({
    where: eq(curatedLists.id, listId),
    columns: { slug: true },
  });
  return list?.slug ?? null;
}

export async function saveListMeta(
  id: string | null,
  values: ListFormValues,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireEditor();
  const parsed = listFormSchema.safeParse(values);
  if (!parsed.success) {
    return fail(parsed.error.issues.map((i) => i.message).join("；"));
  }
  const v = parsed.data;
  const row = {
    slug: v.slug,
    title: v.title,
    theme: v.theme || null,
    intro: (v.intro as TiptapDoc) ?? null,
    sortOrder: v.sortOrder,
  };
  try {
    let targetId = id;
    if (targetId) {
      await db.update(curatedLists).set(row).where(eq(curatedLists.id, targetId));
    } else {
      const [created] = await db
        .insert(curatedLists)
        .values({ ...row, createdBy: session.user.id })
        .returning({ id: curatedLists.id });
      targetId = created.id;
    }
    revalidateList(v.slug);
    return ok({ id: targetId });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
    ) {
      return fail(`slug「${v.slug}」已被使用`);
    }
    throw error;
  }
}

export async function addFilmToList(
  listId: string,
  filmId: string,
): Promise<ActionResult> {
  await requireEditor();
  const [{ maxPos }] = await db
    .select({ maxPos: max(curatedListItems.position) })
    .from(curatedListItems)
    .where(eq(curatedListItems.listId, listId));
  try {
    await db.insert(curatedListItems).values({
      listId,
      filmId,
      position: (maxPos ?? -1) + 1,
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
  const slug = await listSlug(listId);
  if (slug) revalidateList(slug);
  return ok();
}

export async function removeListItem(itemId: string): Promise<ActionResult> {
  await requireEditor();
  const item = await db.query.curatedListItems.findFirst({
    where: eq(curatedListItems.id, itemId),
  });
  if (!item) return fail("条目不存在");
  await db.delete(curatedListItems).where(eq(curatedListItems.id, itemId));
  const slug = await listSlug(item.listId);
  if (slug) revalidateList(slug);
  return ok();
}

/** Rewrites every position in one transaction; last write wins. */
export async function reorderListItems(
  listId: string,
  orderedItemIds: string[],
): Promise<ActionResult> {
  await requireEditor();
  await db.transaction(async (tx) => {
    for (const [i, itemId] of orderedItemIds.entries()) {
      await tx
        .update(curatedListItems)
        .set({ position: i })
        .where(
          and(
            eq(curatedListItems.id, itemId),
            eq(curatedListItems.listId, listId),
          ),
        );
    }
  });
  const slug = await listSlug(listId);
  if (slug) revalidateList(slug);
  return ok();
}

export async function updateItemReasoning(
  itemId: string,
  reasoning: Record<string, unknown> | null,
): Promise<ActionResult> {
  await requireEditor();
  const item = await db.query.curatedListItems.findFirst({
    where: eq(curatedListItems.id, itemId),
  });
  if (!item) return fail("条目不存在");
  await db
    .update(curatedListItems)
    .set({ reasoning: reasoning as TiptapDoc })
    .where(eq(curatedListItems.id, itemId));
  const slug = await listSlug(item.listId);
  if (slug) revalidateList(slug);
  return ok();
}

export async function publishList(id: string): Promise<ActionResult> {
  await requireEditor();
  const list = await db.query.curatedLists.findFirst({
    where: eq(curatedLists.id, id),
  });
  if (!list) return fail("片单不存在");
  const [{ n }] = await db
    .select({ n: count() })
    .from(curatedListItems)
    .where(eq(curatedListItems.listId, id));
  if (n === 0) return fail("片单至少要包含一部影片");
  await db
    .update(curatedLists)
    .set({ status: "published", publishedAt: list.publishedAt ?? new Date() })
    .where(eq(curatedLists.id, id));
  revalidateList(list.slug);
  return ok();
}

export async function unpublishList(id: string): Promise<ActionResult> {
  await requireEditor();
  const list = await db.query.curatedLists.findFirst({
    where: eq(curatedLists.id, id),
  });
  if (!list) return fail("片单不存在");
  await db.update(curatedLists).set({ status: "draft" }).where(eq(curatedLists.id, id));
  revalidateList(list.slug);
  return ok();
}

export async function deleteList(id: string): Promise<ActionResult> {
  await requireEditor();
  const list = await db.query.curatedLists.findFirst({
    where: eq(curatedLists.id, id),
  });
  if (!list) return fail("片单不存在");
  await db.delete(curatedLists).where(eq(curatedLists.id, id));
  revalidateList(list.slug);
  return ok();
}
