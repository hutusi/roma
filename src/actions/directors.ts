"use server";

import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import type { TiptapDoc } from "@/db/schema";
import { directors, directorViewingItems, filmDirectors, films } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { revalidateDirector } from "@/lib/revalidate";
import {
  type DirectorFormValues,
  directorFormSchema,
  publishEnProblems,
  viewingOrderSchema,
} from "@/lib/validators/director";
import { type ActionResult, fail, ok } from "./result";

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
  const existing = id
    ? await db.query.directors.findFirst({
        where: eq(directors.id, id),
        columns: { slug: true, status: true, statusEn: true },
      })
    : undefined;
  // A slug change must also ping the URL the director used to live at.
  const previousSlug = existing?.slug;
  const isPublic = existing?.status === "published";

  // Draft saves stay lax on purpose; a live row must remain publishable.
  if (existing?.statusEn === "published") {
    const problems = publishEnProblems({ bioEn: v.bioEn || null });
    if (problems.length)
      return fail(`英文版已发布，不能存为不可发布的状态：${problems.join("；")}`);
  }

  try {
    let targetId = id;
    if (targetId) {
      await db.update(directors).set(row).where(eq(directors.id, targetId));
    } else {
      const [created] = await db.insert(directors).values(row).returning({ id: directors.id });
      targetId = created.id;
    }
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
  const director = await db.query.directors.findFirst({
    where: eq(directors.id, directorId),
  });
  if (!director) return fail("导演不存在");
  await db.transaction(async (tx) => {
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
  });
  revalidateDirector(director.slug, { notify: true });
  return ok();
}

export async function publishDirector(id: string): Promise<ActionResult> {
  await requireEditor();
  const director = await db.query.directors.findFirst({
    where: eq(directors.id, id),
  });
  if (!director) return fail("导演不存在");
  if (!director.bio && !director.careerEssay) {
    return fail("发布前请填写简介或创作历程");
  }
  await db
    .update(directors)
    .set({
      status: "published",
      publishedAt: director.publishedAt ?? new Date(),
    })
    .where(eq(directors.id, id));
  revalidateDirector(director.slug, { notify: true });
  return ok();
}

export async function publishDirectorEn(id: string): Promise<ActionResult> {
  await requireEditor();
  const director = await db.query.directors.findFirst({
    where: eq(directors.id, id),
  });
  if (!director) return fail("导演不存在");
  const problems = publishEnProblems({ bioEn: director.bioEn });
  if (problems.length) return fail(problems.join("；"));
  await db
    .update(directors)
    .set({
      statusEn: "published",
      publishedEnAt: director.publishedEnAt ?? new Date(),
    })
    .where(eq(directors.id, id));
  revalidateDirector(director.slug, { notify: true });
  return ok();
}

export async function unpublishDirectorEn(id: string): Promise<ActionResult> {
  await requireEditor();
  const director = await db.query.directors.findFirst({
    where: eq(directors.id, id),
  });
  if (!director) return fail("导演不存在");
  await db.update(directors).set({ statusEn: "draft" }).where(eq(directors.id, id));
  revalidateDirector(director.slug, { notify: true });
  return ok();
}

export async function unpublishDirector(id: string): Promise<ActionResult> {
  await requireEditor();
  const director = await db.query.directors.findFirst({
    where: eq(directors.id, id),
  });
  if (!director) return fail("导演不存在");
  await db.update(directors).set({ status: "draft" }).where(eq(directors.id, id));
  revalidateDirector(director.slug, { notify: true });
  return ok();
}

export async function deleteDirector(id: string): Promise<ActionResult> {
  await requireEditor();
  const director = await db.query.directors.findFirst({
    where: eq(directors.id, id),
  });
  if (!director) return fail("导演不存在");
  // film_directors.director_id cascades, so deleting a director silently
  // strips the credit from every film citing them — including published
  // ones, which the publish gate requires to have at least one director.
  // The cascade is right for cleanup, wrong as an editorial action.
  const [{ n }] = await db
    .select({ n: count() })
    .from(filmDirectors)
    .innerJoin(films, eq(filmDirectors.filmId, films.id))
    .where(and(eq(filmDirectors.directorId, id), eq(films.status, "published")));
  if (n > 0) {
    return fail(`该导演仍关联 ${n} 部已发布影片，请先解除关联或下架这些影片`);
  }
  await db.delete(directors).where(eq(directors.id, id));
  revalidateDirector(director.slug, { notify: true });
  return ok();
}
