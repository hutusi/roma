"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { directors, directorViewingItems } from "@/db/schema";
import type { TiptapDoc } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { revalidateDirector } from "@/lib/revalidate";
import {
  directorFormSchema,
  viewingOrderSchema,
  type DirectorFormValues,
} from "@/lib/validators/director";
import { fail, ok, type ActionResult } from "./result";

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
  };
  try {
    let targetId = id;
    if (targetId) {
      await db.update(directors).set(row).where(eq(directors.id, targetId));
    } else {
      const [created] = await db
        .insert(directors)
        .values(row)
        .returning({ id: directors.id });
      targetId = created.id;
    }
    revalidateDirector(v.slug);
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
  items: { filmId: string; note?: string }[],
): Promise<ActionResult> {
  await requireEditor();
  const parsed = viewingOrderSchema.safeParse(items);
  if (!parsed.success) return fail("观看顺序数据无效");
  const director = await db.query.directors.findFirst({
    where: eq(directors.id, directorId),
  });
  if (!director) return fail("导演不存在");
  await db.transaction(async (tx) => {
    await tx
      .delete(directorViewingItems)
      .where(eq(directorViewingItems.directorId, directorId));
    if (parsed.data.length) {
      await tx.insert(directorViewingItems).values(
        parsed.data.map((item, i) => ({
          directorId,
          filmId: item.filmId,
          note: item.note || null,
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
