"use server";

import { and, count, eq, max } from "drizzle-orm";
import { db } from "@/db";
import type { TiptapDoc } from "@/db/schema";
import { curatedListItems, curatedLists } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { revalidateList } from "@/lib/revalidate";
import { type ListFormValues, listFormSchema, publishEnProblems } from "@/lib/validators/list";
import { type ActionResult, fail, ok } from "./result";

/** Slug to revalidate, plus whether the list has a public URL to notify. */
async function listMeta(listId: string) {
  return db.query.curatedLists.findFirst({
    where: eq(curatedLists.id, listId),
    columns: { slug: true, status: true },
  });
}

function revalidateListMeta(list: { slug: string; status: string } | undefined) {
  if (!list) return;
  revalidateList(list.slug, { notify: list.status === "published" });
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
  const existing = id
    ? await db.query.curatedLists.findFirst({
        where: eq(curatedLists.id, id),
        columns: { slug: true, status: true, statusEn: true },
      })
    : undefined;
  // A slug change must also ping the URL the list used to live at.
  const previousSlug = existing?.slug;
  const isPublic = existing?.status === "published";

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
    revalidateList(v.slug, { notify: isPublic });
    if (isPublic && previousSlug && previousSlug !== v.slug) {
      revalidateList(previousSlug, { notify: true });
    }
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
  revalidateListMeta(await listMeta(listId));
  return ok();
}

export async function removeListItem(itemId: string): Promise<ActionResult> {
  await requireEditor();
  const item = await db.query.curatedListItems.findFirst({
    where: eq(curatedListItems.id, itemId),
  });
  if (!item) return fail("条目不存在");
  await db.delete(curatedListItems).where(eq(curatedListItems.id, itemId));
  revalidateListMeta(await listMeta(item.listId));
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
  revalidateListMeta(await listMeta(listId));
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
  revalidateListMeta(await listMeta(item.listId));
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
  revalidateList(list.slug, { notify: true });
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
  revalidateList(list.slug, { notify: true });
  return ok();
}

export async function unpublishListEn(id: string): Promise<ActionResult> {
  await requireEditor();
  const list = await db.query.curatedLists.findFirst({
    where: eq(curatedLists.id, id),
  });
  if (!list) return fail("片单不存在");
  await db.update(curatedLists).set({ statusEn: "draft" }).where(eq(curatedLists.id, id));
  revalidateList(list.slug, { notify: true });
  return ok();
}

export async function unpublishList(id: string): Promise<ActionResult> {
  await requireEditor();
  const list = await db.query.curatedLists.findFirst({
    where: eq(curatedLists.id, id),
  });
  if (!list) return fail("片单不存在");
  await db.update(curatedLists).set({ status: "draft" }).where(eq(curatedLists.id, id));
  revalidateList(list.slug, { notify: true });
  return ok();
}

export async function deleteList(id: string): Promise<ActionResult> {
  await requireEditor();
  const list = await db.query.curatedLists.findFirst({
    where: eq(curatedLists.id, id),
  });
  if (!list) return fail("片单不存在");
  await db.delete(curatedLists).where(eq(curatedLists.id, id));
  revalidateList(list.slug, { notify: true });
  return ok();
}
