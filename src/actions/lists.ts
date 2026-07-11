"use server";

import { and, count, eq, max } from "drizzle-orm";
import { db } from "@/db";
import type { TiptapDoc } from "@/db/schema";
import { curatedListItems, curatedLists } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { revalidateList } from "@/lib/revalidate";
import { type ListFormValues, listFormSchema, publishEnProblems } from "@/lib/validators/list";
import { type ActionResult, fail, ok } from "./result";

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
    titleEn: v.titleEn || null,
    themeEn: v.themeEn || null,
    introEn: (v.introEn as TiptapDoc) ?? null,
    sortOrder: v.sortOrder,
  };
  // A slug change must also refresh the page cached under the old slug.
  const previousSlug = id ? await listSlug(id) : undefined;

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
    if (previousSlug && previousSlug !== v.slug) revalidateList(previousSlug);
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

export async function addFilmToList(listId: string, filmId: string): Promise<ActionResult> {
  await requireEditor();
  try {
    // max()+insert in one transaction so concurrent adds can't compute
    // the same position.
    await db.transaction(async (tx) => {
      const [{ maxPos }] = await tx
        .select({ maxPos: max(curatedListItems.position) })
        .from(curatedListItems)
        .where(eq(curatedListItems.listId, listId));
      await tx.insert(curatedListItems).values({
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
        .where(and(eq(curatedListItems.id, itemId), eq(curatedListItems.listId, listId)));
    }
  });
  const slug = await listSlug(listId);
  if (slug) revalidateList(slug);
  return ok();
}

export async function updateItemReasoning(
  itemId: string,
  reasoning: Record<string, unknown> | null,
  locale: "zh" | "en" = "zh",
): Promise<ActionResult> {
  await requireEditor();
  const item = await db.query.curatedListItems.findFirst({
    where: eq(curatedListItems.id, itemId),
  });
  if (!item) return fail("条目不存在");
  await db
    .update(curatedListItems)
    .set(
      locale === "en"
        ? { reasoningEn: reasoning as TiptapDoc }
        : { reasoning: reasoning as TiptapDoc },
    )
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

export async function publishListEn(id: string): Promise<ActionResult> {
  await requireEditor();
  const list = await db.query.curatedLists.findFirst({
    where: eq(curatedLists.id, id),
  });
  if (!list) return fail("片单不存在");
  const problems = publishEnProblems({ titleEn: list.titleEn });
  if (problems.length) return fail(problems.join("；"));
  await db
    .update(curatedLists)
    .set({ statusEn: "published", publishedEnAt: list.publishedEnAt ?? new Date() })
    .where(eq(curatedLists.id, id));
  revalidateList(list.slug);
  return ok();
}

export async function unpublishListEn(id: string): Promise<ActionResult> {
  await requireEditor();
  const list = await db.query.curatedLists.findFirst({
    where: eq(curatedLists.id, id),
  });
  if (!list) return fail("片单不存在");
  await db.update(curatedLists).set({ statusEn: "draft" }).where(eq(curatedLists.id, id));
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
