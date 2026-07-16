"use server";

import { and, eq, max, sql } from "drizzle-orm";
import { db } from "@/db";
import { lockCuratedList, lockFilm } from "@/db/locks";
import type { TiptapDoc } from "@/db/schema";
import { curatedListItems, curatedLists, films } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { publishedMemberCount } from "@/lib/list-invariants";
import { revalidateList } from "@/lib/revalidate";
import { type ListFormValues, listFormSchema, publishEnProblems } from "@/lib/validators/list";
import { permutationProblem } from "@/lib/validators/ordering";
import { tiptapDocSchema } from "@/lib/validators/prose";
import { type ActionResult, fail, ok } from "./result";

type ListMeta = { slug: string; status: string };

function revalidateListMeta(list: ListMeta) {
  revalidateList(list.slug, { notify: list.status === "published" });
}

function isListMeta<T extends { slug?: string; status?: string }>(value: T): value is T & ListMeta {
  return typeof value.slug === "string" && typeof value.status === "string";
}

function hasSlug<T extends { slug?: string }>(value: T): value is T & { slug: string } {
  return typeof value.slug === "string";
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export async function saveListMeta(
  id: string | null,
  values: ListFormValues,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireEditor();
  const parsed = listFormSchema.safeParse(values);
  if (!parsed.success) return fail(parsed.error.issues.map((issue) => issue.message).join("；"));
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

  try {
    const outcome = await db.transaction(async (tx) => {
      let targetId = id;
      const existing = targetId ? await lockCuratedList(tx, targetId) : undefined;
      if (targetId && !existing) return { error: "片单不存在，可能已被删除" } as const;
      if (existing?.statusEn === "published") {
        const problems = publishEnProblems({ titleEn: v.titleEn || null });
        if (problems.length) {
          return {
            error: `英文版已发布，不能存为不可发布的状态：${problems.join("；")}`,
          } as const;
        }
      }

      if (targetId) {
        await tx.update(curatedLists).set(row).where(eq(curatedLists.id, targetId));
      } else {
        const [created] = await tx
          .insert(curatedLists)
          .values({ ...row, createdBy: session.user.id })
          .returning({ id: curatedLists.id });
        targetId = created.id;
      }
      return {
        id: targetId,
        previousSlug: existing?.slug,
        wasPublic: existing?.status === "published",
      } as const;
    });
    if ("error" in outcome && outcome.error) return fail(outcome.error);
    revalidateList(v.slug, { notify: outcome.wasPublic });
    if (outcome.wasPublic && outcome.previousSlug && outcome.previousSlug !== v.slug) {
      revalidateList(outcome.previousSlug, { notify: true });
    }
    return ok({ id: outcome.id });
  } catch (error) {
    if (isUniqueViolation(error)) return fail(`slug「${v.slug}」已被使用`);
    throw error;
  }
}

export async function addFilmToList(listId: string, filmId: string): Promise<ActionResult> {
  await requireEditor();
  try {
    const outcome = await db.transaction(async (tx) => {
      const film = await lockFilm(tx, filmId);
      if (!film) return { error: "影片不存在，可能已被删除" } as const;
      const list = await lockCuratedList(tx, listId);
      if (!list) return { error: "片单不存在，可能已被删除" } as const;
      const [{ maxPos }] = await tx
        .select({ maxPos: max(curatedListItems.position) })
        .from(curatedListItems)
        .where(eq(curatedListItems.listId, listId));
      await tx.insert(curatedListItems).values({ listId, filmId, position: (maxPos ?? -1) + 1 });
      return { slug: list.slug, status: list.status } as const;
    });
    if ("error" in outcome && outcome.error) return fail(outcome.error);
    revalidateListMeta(outcome);
    return ok();
  } catch (error) {
    if (isUniqueViolation(error)) return fail("这部影片已在片单中");
    throw error;
  }
}

export async function removeListItem(itemId: string): Promise<ActionResult> {
  await requireEditor();
  const pointer = await db.query.curatedListItems.findFirst({
    where: eq(curatedListItems.id, itemId),
    columns: { listId: true },
  });
  if (!pointer) return fail("条目不存在");

  const outcome = await db.transaction(async (tx) => {
    const list = await lockCuratedList(tx, pointer.listId);
    if (!list) return { error: "片单不存在，可能已被删除" } as const;
    const [item] = await tx
      .select({ id: curatedListItems.id, filmStatus: films.status })
      .from(curatedListItems)
      .innerJoin(films, eq(curatedListItems.filmId, films.id))
      .where(eq(curatedListItems.id, itemId));
    if (!item) return { error: "条目不存在" } as const;
    if (
      list.status === "published" &&
      item.filmStatus === "published" &&
      (await publishedMemberCount(tx, list.id)) === 1
    ) {
      return {
        error: "这是片单中最后一部已发布影片，移除会使已发布片单变空；请先下架片单",
      } as const;
    }
    await tx.delete(curatedListItems).where(eq(curatedListItems.id, itemId));
    return { slug: list.slug, status: list.status } as const;
  });
  if (!isListMeta(outcome)) return fail(outcome.error ?? "片单操作失败");
  revalidateListMeta(outcome);
  return ok();
}

async function movePositionsOutOfRange(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  listId: string,
  currentMax: number | null,
) {
  if (currentMax === null) return;
  const offset = currentMax + 1;
  await tx
    .update(curatedListItems)
    .set({ position: sql`${curatedListItems.position} + ${offset}` })
    .where(eq(curatedListItems.listId, listId));
}

export async function reorderListItems(
  listId: string,
  orderedItemIds: string[],
): Promise<ActionResult> {
  await requireEditor();
  const outcome = await db.transaction(async (tx) => {
    const list = await lockCuratedList(tx, listId);
    if (!list) return { error: "片单不存在，可能已被删除" } as const;
    const current = await tx
      .select({ id: curatedListItems.id, position: curatedListItems.position })
      .from(curatedListItems)
      .where(eq(curatedListItems.listId, listId));
    if (
      permutationProblem(
        orderedItemIds,
        current.map((item) => item.id),
      )
    ) {
      return { error: "片单条目已变化，请刷新后重试" } as const;
    }
    await movePositionsOutOfRange(
      tx,
      listId,
      current.length ? Math.max(...current.map((item) => item.position)) : null,
    );
    for (const [position, itemId] of orderedItemIds.entries()) {
      await tx
        .update(curatedListItems)
        .set({ position })
        .where(and(eq(curatedListItems.id, itemId), eq(curatedListItems.listId, listId)));
    }
    return { slug: list.slug, status: list.status } as const;
  });
  if ("error" in outcome && outcome.error) return fail(outcome.error);
  revalidateListMeta(outcome);
  return ok();
}

export async function updateItemReasoning(
  itemId: string,
  reasoning: Record<string, unknown> | null,
  locale: "zh" | "en" = "zh",
): Promise<ActionResult> {
  await requireEditor();
  const parsed = tiptapDocSchema.safeParse(reasoning);
  if (!parsed.success) return fail(parsed.error.issues.map((issue) => issue.message).join("；"));
  const pointer = await db.query.curatedListItems.findFirst({
    where: eq(curatedListItems.id, itemId),
    columns: { listId: true },
  });
  if (!pointer) return fail("条目不存在");

  const outcome = await db.transaction(async (tx) => {
    const list = await lockCuratedList(tx, pointer.listId);
    if (!list) return { error: "片单不存在，可能已被删除" } as const;
    const updated = await tx
      .update(curatedListItems)
      .set(
        locale === "en"
          ? { reasoningEn: parsed.data as TiptapDoc | null }
          : { reasoning: parsed.data as TiptapDoc | null },
      )
      .where(and(eq(curatedListItems.id, itemId), eq(curatedListItems.listId, list.id)))
      .returning({ id: curatedListItems.id });
    if (!updated.length) return { error: "条目不存在" } as const;
    return { slug: list.slug, status: list.status } as const;
  });
  if ("error" in outcome && outcome.error) return fail(outcome.error);
  revalidateListMeta(outcome);
  return ok();
}

export async function publishList(id: string): Promise<ActionResult> {
  await requireEditor();
  const outcome = await db.transaction(async (tx) => {
    const list = await lockCuratedList(tx, id);
    if (!list) return { error: "片单不存在" } as const;
    if ((await publishedMemberCount(tx, id)) === 0) {
      return { error: "片单至少要包含一部已发布影片" } as const;
    }
    await tx
      .update(curatedLists)
      .set({ status: "published", publishedAt: list.publishedAt ?? new Date() })
      .where(eq(curatedLists.id, id));
    return { slug: list.slug } as const;
  });
  if ("error" in outcome && outcome.error) return fail(outcome.error);
  revalidateList(outcome.slug, { notify: true });
  return ok();
}

export async function publishListEn(id: string): Promise<ActionResult> {
  await requireEditor();
  const outcome = await db.transaction(async (tx) => {
    const list = await lockCuratedList(tx, id);
    if (!list) return { error: "片单不存在" } as const;
    const problems = publishEnProblems({ titleEn: list.titleEn });
    if (problems.length) return { error: problems.join("；") } as const;
    await tx
      .update(curatedLists)
      .set({ statusEn: "published", publishedEnAt: list.publishedEnAt ?? new Date() })
      .where(eq(curatedLists.id, id));
    return { slug: list.slug, isPublic: list.status === "published" } as const;
  });
  if (!hasSlug(outcome)) return fail(outcome.error ?? "片单操作失败");
  revalidateList(outcome.slug, { notify: outcome.isPublic });
  return ok();
}

export async function unpublishListEn(id: string): Promise<ActionResult> {
  await requireEditor();
  const outcome = await db.transaction(async (tx) => {
    const list = await lockCuratedList(tx, id);
    if (!list) return null;
    await tx.update(curatedLists).set({ statusEn: "draft" }).where(eq(curatedLists.id, id));
    return { slug: list.slug, isPublic: list.status === "published" };
  });
  if (!outcome) return fail("片单不存在");
  revalidateList(outcome.slug, { notify: outcome.isPublic });
  return ok();
}

export async function unpublishList(id: string): Promise<ActionResult> {
  await requireEditor();
  const outcome = await db.transaction(async (tx) => {
    const list = await lockCuratedList(tx, id);
    if (!list) return null;
    await tx.update(curatedLists).set({ status: "draft" }).where(eq(curatedLists.id, id));
    return { slug: list.slug, wasPublic: list.status === "published" };
  });
  if (!outcome) return fail("片单不存在");
  revalidateList(outcome.slug, { notify: outcome.wasPublic });
  return ok();
}

export async function deleteList(id: string): Promise<ActionResult> {
  await requireEditor();
  const outcome = await db.transaction(async (tx) => {
    const list = await lockCuratedList(tx, id);
    if (!list) return null;
    await tx.delete(curatedLists).where(eq(curatedLists.id, id));
    return { slug: list.slug, wasPublic: list.status === "published" };
  });
  if (!outcome) return fail("片单不存在");
  revalidateList(outcome.slug, { notify: outcome.wasPublic });
  return ok();
}
