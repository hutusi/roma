"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import type { TiptapDoc } from "@/db/schema";
import { directors, directorViewingItems } from "@/db/schema";
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
  // A slug change must also refresh the page cached under the old slug.
  const previousSlug = id
    ? (
        await db.query.directors.findFirst({
          where: eq(directors.id, id),
          columns: { slug: true },
        })
      )?.slug
    : undefined;

  try {
    let targetId = id;
    if (targetId) {
      await db.update(directors).set(row).where(eq(directors.id, targetId));
    } else {
      const [created] = await db.insert(directors).values(row).returning({ id: directors.id });
      targetId = created.id;
    }
    revalidateDirector(v.slug);
    if (previousSlug && previousSlug !== v.slug) revalidateDirector(previousSlug);
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
  revalidateDirector(director.slug);
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
  revalidateDirector(director.slug);
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
  revalidateDirector(director.slug);
  return ok();
}

export async function unpublishDirectorEn(id: string): Promise<ActionResult> {
  await requireEditor();
  const director = await db.query.directors.findFirst({
    where: eq(directors.id, id),
  });
  if (!director) return fail("导演不存在");
  await db.update(directors).set({ statusEn: "draft" }).where(eq(directors.id, id));
  revalidateDirector(director.slug);
  return ok();
}

export async function unpublishDirector(id: string): Promise<ActionResult> {
  await requireEditor();
  const director = await db.query.directors.findFirst({
    where: eq(directors.id, id),
  });
  if (!director) return fail("导演不存在");
  await db.update(directors).set({ status: "draft" }).where(eq(directors.id, id));
  revalidateDirector(director.slug);
  return ok();
}

export async function deleteDirector(id: string): Promise<ActionResult> {
  await requireEditor();
  const director = await db.query.directors.findFirst({
    where: eq(directors.id, id),
  });
  if (!director) return fail("导演不存在");
  await db.delete(directors).where(eq(directors.id, id));
  revalidateDirector(director.slug);
  return ok();
}
