"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { lockDirector, lockFilms } from "@/db/locks";
import type { TiptapDoc } from "@/db/schema";
import { directors, directorViewingItems, filmDirectors, films } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { revalidateDirector } from "@/lib/revalidate";
import {
  type DirectorFormValues,
  directorFormSchema,
  publishEnProblems,
  publishProblems,
  viewingOrderSchema,
} from "@/lib/validators/director";
import { type ActionResult, fail, ok } from "./result";

function hasSlug<T extends { slug?: string }>(value: T): value is T & { slug: string } {
  return typeof value.slug === "string";
}

export async function saveDirector(
  id: string | null,
  values: DirectorFormValues,
): Promise<ActionResult<{ id: string }>> {
  await requireEditor();
  const parsed = directorFormSchema.safeParse(values);
  if (!parsed.success) {
    return fail(parsed.error.issues.map((i) => i.message).join("；"));
  }
  const v = parsed.data;
  const row = {
    slug: v.slug,
    name: v.name,
    nameZh: v.nameZh || null,
    bio: v.bio || null,
    careerEssay: (v.careerEssay as TiptapDoc) ?? null,
    bioEn: v.bioEn || null,
    careerEssayEn: (v.careerEssayEn as TiptapDoc) ?? null,
  };
  try {
    const outcome = await db.transaction(async (tx) => {
      let targetId = id;
      const existing = targetId ? await lockDirector(tx, targetId) : undefined;
      if (targetId && !existing) return { error: "导演不存在，可能已被删除" } as const;
      const previousSlug = existing?.slug;
      const isPublic = existing?.status === "published";

      if (isPublic) {
        const problems = publishProblems({
          bio: v.bio || null,
          careerEssay: (v.careerEssay as TiptapDoc) ?? null,
        });
        if (problems.length) {
          return {
            error: `导演已发布，不能存为不可发布的状态：${problems.join("；")}`,
          } as const;
        }
      }
      if (existing?.statusEn === "published") {
        const problems = publishEnProblems({ bioEn: v.bioEn || null });
        if (problems.length) {
          return {
            error: `英文版已发布，不能存为不可发布的状态：${problems.join("；")}`,
          } as const;
        }
      }

      if (targetId) {
        await tx.update(directors).set(row).where(eq(directors.id, targetId));
      } else {
        const [created] = await tx.insert(directors).values(row).returning({ id: directors.id });
        targetId = created.id;
      }
      return { id: targetId, previousSlug, isPublic } as const;
    });
    if ("error" in outcome && outcome.error) return fail(outcome.error);
    const { id: targetId, previousSlug, isPublic } = outcome;
    revalidateDirector(v.slug, { notify: isPublic });
    if (isPublic && previousSlug && previousSlug !== v.slug) {
      revalidateDirector(previousSlug, { notify: true });
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

export async function setViewingOrder(
  directorId: string,
  items: { filmId: string; note?: string; noteEn?: string }[],
): Promise<ActionResult> {
  await requireEditor();
  const parsed = viewingOrderSchema.safeParse(items);
  if (!parsed.success) return fail("观看顺序数据无效");
  const outcome = await db.transaction(async (tx) => {
    const director = await lockDirector(tx, directorId);
    if (!director) return { error: "导演不存在" } as const;
    const lockedFilms = await lockFilms(
      tx,
      parsed.data.map((item) => item.filmId),
    );
    if (lockedFilms.length !== new Set(parsed.data.map((item) => item.filmId)).size) {
      return { error: "观看顺序中的影片不存在，可能已被删除" } as const;
    }
    await tx.delete(directorViewingItems).where(eq(directorViewingItems.directorId, directorId));
    if (parsed.data.length) {
      await tx.insert(directorViewingItems).values(
        parsed.data.map((item, i) => ({
          directorId,
          filmId: item.filmId,
          note: item.note || null,
          noteEn: item.noteEn || null,
          position: i,
        })),
      );
    }
    return { slug: director.slug, isPublic: director.status === "published" } as const;
  });
  if (!hasSlug(outcome)) return fail(outcome.error ?? "导演操作失败");
  revalidateDirector(outcome.slug, { notify: outcome.isPublic });
  return ok();
}

export async function publishDirector(id: string): Promise<ActionResult> {
  await requireEditor();
  const outcome = await db.transaction(async (tx) => {
    const director = await lockDirector(tx, id);
    if (!director) return { error: "导演不存在" } as const;
    const problems = publishProblems(director);
    if (problems.length) return { error: problems.join("；") } as const;
    await tx
      .update(directors)
      .set({ status: "published", publishedAt: director.publishedAt ?? new Date() })
      .where(eq(directors.id, id));
    return { slug: director.slug } as const;
  });
  if (!hasSlug(outcome)) return fail(outcome.error ?? "导演操作失败");
  revalidateDirector(outcome.slug, { notify: true });
  return ok();
}

export async function publishDirectorEn(id: string): Promise<ActionResult> {
  await requireEditor();
  const outcome = await db.transaction(async (tx) => {
    const director = await lockDirector(tx, id);
    if (!director) return { error: "导演不存在" } as const;
    const problems = publishEnProblems({ bioEn: director.bioEn });
    if (problems.length) return { error: problems.join("；") } as const;
    await tx
      .update(directors)
      .set({ statusEn: "published", publishedEnAt: director.publishedEnAt ?? new Date() })
      .where(eq(directors.id, id));
    return { slug: director.slug, isPublic: director.status === "published" } as const;
  });
  if (!hasSlug(outcome)) return fail(outcome.error ?? "导演操作失败");
  revalidateDirector(outcome.slug, { notify: outcome.isPublic });
  return ok();
}

export async function unpublishDirectorEn(id: string): Promise<ActionResult> {
  await requireEditor();
  const outcome = await db.transaction(async (tx) => {
    const director = await lockDirector(tx, id);
    if (!director) return null;
    await tx.update(directors).set({ statusEn: "draft" }).where(eq(directors.id, id));
    return { slug: director.slug, isPublic: director.status === "published" };
  });
  if (!outcome) return fail("导演不存在");
  revalidateDirector(outcome.slug, { notify: outcome.isPublic });
  return ok();
}

export async function unpublishDirector(id: string): Promise<ActionResult> {
  await requireEditor();
  const outcome = await db.transaction(async (tx) => {
    const director = await lockDirector(tx, id);
    if (!director) return null;
    await tx.update(directors).set({ status: "draft" }).where(eq(directors.id, id));
    return { slug: director.slug, wasPublic: director.status === "published" };
  });
  if (!outcome) return fail("导演不存在");
  revalidateDirector(outcome.slug, { notify: outcome.wasPublic });
  return ok();
}

export async function deleteDirector(id: string): Promise<ActionResult> {
  await requireEditor();
  const outcome = await db.transaction(async (tx) => {
    const director = await lockDirector(tx, id);
    if (!director) return { error: "导演不存在" } as const;
    const associated = await tx
      .select({ filmId: filmDirectors.filmId })
      .from(filmDirectors)
      .where(eq(filmDirectors.directorId, id));
    await lockFilms(
      tx,
      associated.map((row) => row.filmId),
    );
    // A save that was already ahead of us may have removed this director
    // while we waited for the film locks. Re-read the relation after all
    // locks are held so a no-longer-associated published film cannot cause
    // a false refusal.
    const currentPublished = await tx
      .select({ filmId: filmDirectors.filmId })
      .from(filmDirectors)
      .innerJoin(films, eq(filmDirectors.filmId, films.id))
      .where(and(eq(filmDirectors.directorId, id), eq(films.status, "published")));
    const publishedCount = currentPublished.length;
    if (publishedCount > 0) {
      return {
        error: `该导演仍关联 ${publishedCount} 部已发布影片，请先解除关联或下架这些影片`,
      } as const;
    }
    await tx.delete(directors).where(eq(directors.id, id));
    return { slug: director.slug, wasPublic: director.status === "published" } as const;
  });
  if ("error" in outcome && outcome.error) return fail(outcome.error);
  revalidateDirector(outcome.slug, { notify: outcome.wasPublic });
  return ok();
}
