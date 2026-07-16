"use server";

import { and, eq, max } from "drizzle-orm";
import { db } from "@/db";
import type { TiptapDoc } from "@/db/schema";
import { curatedListItems, curatedLists } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { publishedMemberCount } from "@/lib/list-invariants";
import { revalidateList } from "@/lib/revalidate";
import { type ListFormValues, listFormSchema, publishEnProblems } from "@/lib/validators/list";
import { permutationProblem } from "@/lib/validators/ordering";
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
  // An edit against an id that no longer exists (deleted in another tab)
  // would UPDATE zero rows and still report success; catch it here.
  if (id && !existing) return fail("片单不存在，可能已被删除");
  // A slug change must also ping the URL the list used to live at.
  const previousSlug = existing?.slug;
  const isPublic = existing?.status === "published";

  // Draft saves stay lax on purpose; a live row must remain publishable.
  if (existing?.statusEn === "published") {
    const problems = publishEnProblems({ titleEn: v.titleEn || null });
    if (problems.length)
      return fail(`英文版已发布，不能存为不可发布的状态：${problems.join("；")}`);
  }

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
    // The transaction makes the read and the insert atomic, but NOT
    // mutually exclusive: under READ COMMITTED (the default here) two
    // concurrent adds both see the same max() — neither sees the other's
    // uncommitted row — and both write maxPos + 1. Nothing enforces
    // unique positions, so the duplicates land and the two items tie.
    // Accepted rather than fixed: serializing this needs SERIALIZABLE or
    // an advisory lock plus a unique (list_id, position) constraint and a
    // backfill, which is a lot of machinery for a two-editor site where
    // the tie only costs an arbitrary order between two items.
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
    with: { list: { columns: { status: true } }, film: { columns: { status: true } } },
  });
  if (!item) return fail("条目不存在");
  // publishList guarantees a published list has >= 1 published member;
  // removing the last one would leave it live and empty. Block it and
  // tell the editor to unpublish the list first. (Removing a draft member,
  // or removing from a draft list, is always fine.)
  if (
    item.list.status === "published" &&
    item.film.status === "published" &&
    (await publishedMemberCount(item.listId)) === 1
  ) {
    return fail("这是片单中最后一部已发布影片，移除会使已发布片单变空；请先下架片单");
  }
  await db.delete(curatedListItems).where(eq(curatedListItems.id, itemId));
  revalidateListMeta(await listMeta(item.listId));
  return ok();
}

/**
 * Rewrites every position in one transaction, and now verifies that it
 * was actually handed every one: an incomplete or duplicated list would
 * strand the omitted items on stale positions that collide with the ones
 * just assigned, and position has no unique constraint to catch it. Ids
 * from another list were always no-ops (the listId predicate below), but
 * "the UI always sends the full set" turned out to be false on the
 * user-list side, so this checks rather than trusts.
 */
export async function reorderListItems(
  listId: string,
  orderedItemIds: string[],
): Promise<ActionResult> {
  await requireEditor();
  const current = await db
    .select({ id: curatedListItems.id })
    .from(curatedListItems)
    .where(eq(curatedListItems.listId, listId));
  if (
    permutationProblem(
      orderedItemIds,
      current.map((i) => i.id),
    )
  ) {
    return fail("片单条目已变化，请刷新后重试");
  }
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
  // Count what the public actually renders. The gate counted every item
  // including drafts, while the read layer strips them, so a list of
  // nothing but drafts passed and published an empty <ol>.
  if ((await publishedMemberCount(id)) === 0) return fail("片单至少要包含一部已发布影片");
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
  revalidateList(list.slug, { notify: list.status === "published" });
  return ok();
}

export async function unpublishListEn(id: string): Promise<ActionResult> {
  await requireEditor();
  const list = await db.query.curatedLists.findFirst({
    where: eq(curatedLists.id, id),
  });
  if (!list) return fail("片单不存在");
  await db.update(curatedLists).set({ statusEn: "draft" }).where(eq(curatedLists.id, id));
  revalidateList(list.slug, { notify: list.status === "published" });
  return ok();
}

export async function unpublishList(id: string): Promise<ActionResult> {
  await requireEditor();
  const list = await db.query.curatedLists.findFirst({
    where: eq(curatedLists.id, id),
  });
  if (!list) return fail("片单不存在");
  await db.update(curatedLists).set({ status: "draft" }).where(eq(curatedLists.id, id));
  revalidateList(list.slug, { notify: list.status === "published" });
  return ok();
}

export async function deleteList(id: string): Promise<ActionResult> {
  await requireEditor();
  const list = await db.query.curatedLists.findFirst({
    where: eq(curatedLists.id, id),
  });
  if (!list) return fail("片单不存在");
  await db.delete(curatedLists).where(eq(curatedLists.id, id));
  revalidateList(list.slug, { notify: list.status === "published" });
  return ok();
}
