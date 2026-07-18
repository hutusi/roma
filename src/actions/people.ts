"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { lockFilms, lockPerson } from "@/db/locks";
import type { TiptapDoc } from "@/db/schema";
import { directorViewingItems, filmDirectors, films, people } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { revalidatePerson } from "@/lib/revalidate";
import {
  type PersonFormValues,
  personFormSchema,
  publishEnProblems,
  publishProblems,
  viewingOrderSchema,
} from "@/lib/validators/person";
import { type ActionResult, fail, ok } from "./result";

function hasSlug<T extends { slug?: string }>(value: T): value is T & { slug: string } {
  return typeof value.slug === "string";
}

export async function savePerson(
  id: string | null,
  values: PersonFormValues,
): Promise<ActionResult<{ id: string }>> {
  await requireEditor();
  const parsed = personFormSchema.safeParse(values);
  if (!parsed.success) {
    return fail(parsed.error.issues.map((i) => i.message).join("；"));
  }
  const v = parsed.data;
  const row = {
    slug: v.slug,
    name: v.name,
    nameZh: v.nameZh || null,
    primaryRole: v.primaryRole,
    bio: v.bio || null,
    careerEssay: (v.careerEssay as TiptapDoc) ?? null,
    bioEn: v.bioEn || null,
    careerEssayEn: (v.careerEssayEn as TiptapDoc) ?? null,
  };
  try {
    const outcome = await db.transaction(async (tx) => {
      let targetId = id;
      const existing = targetId ? await lockPerson(tx, targetId) : undefined;
      if (targetId && !existing) return { error: "人物不存在，可能已被删除" } as const;
      const previousSlug = existing?.slug;
      const previousRole = existing?.primaryRole;
      const isPublic = existing?.status === "published";

      if (isPublic) {
        const problems = publishProblems({
          bio: v.bio || null,
          careerEssay: (v.careerEssay as TiptapDoc) ?? null,
        });
        if (problems.length) {
          return {
            error: `人物已发布，不能存为不可发布的状态：${problems.join("；")}`,
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
        await tx.update(people).set(row).where(eq(people.id, targetId));
      } else {
        const [created] = await tx.insert(people).values(row).returning({ id: people.id });
        targetId = created.id;
      }
      return { id: targetId, previousSlug, previousRole, isPublic } as const;
    });
    if ("error" in outcome && outcome.error) return fail(outcome.error);
    const { id: targetId, previousSlug, previousRole, isPublic } = outcome;
    revalidatePerson(v.slug, v.primaryRole, { notify: isPublic });
    // A moved canonical URL (slug or role change) leaves the old one
    // 308ing — notify it so crawlers recrawl and follow.
    if (
      isPublic &&
      previousSlug &&
      previousRole &&
      (previousSlug !== v.slug || previousRole !== v.primaryRole)
    ) {
      revalidatePerson(previousSlug, previousRole, { notify: true });
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
  personId: string,
  items: { filmId: string; note?: string; noteEn?: string }[],
): Promise<ActionResult> {
  await requireEditor();
  const parsed = viewingOrderSchema.safeParse(items);
  if (!parsed.success) return fail("观看顺序数据无效");
  const outcome = await db.transaction(async (tx) => {
    const person = await lockPerson(tx, personId);
    if (!person) return { error: "人物不存在" } as const;
    const lockedFilms = await lockFilms(
      tx,
      parsed.data.map((item) => item.filmId),
    );
    if (lockedFilms.length !== new Set(parsed.data.map((item) => item.filmId)).size) {
      return { error: "观看顺序中的影片不存在，可能已被删除" } as const;
    }
    await tx.delete(directorViewingItems).where(eq(directorViewingItems.directorId, personId));
    if (parsed.data.length) {
      await tx.insert(directorViewingItems).values(
        parsed.data.map((item, i) => ({
          directorId: personId,
          filmId: item.filmId,
          note: item.note || null,
          noteEn: item.noteEn || null,
          position: i,
        })),
      );
    }
    return {
      slug: person.slug,
      role: person.primaryRole,
      isPublic: person.status === "published",
    } as const;
  });
  if (!hasSlug(outcome)) return fail(outcome.error ?? "人物操作失败");
  revalidatePerson(outcome.slug, outcome.role, { notify: outcome.isPublic });
  return ok();
}

export async function publishPerson(id: string): Promise<ActionResult> {
  await requireEditor();
  const outcome = await db.transaction(async (tx) => {
    const person = await lockPerson(tx, id);
    if (!person) return { error: "人物不存在" } as const;
    const problems = publishProblems(person);
    if (problems.length) return { error: problems.join("；") } as const;
    await tx
      .update(people)
      .set({ status: "published", publishedAt: person.publishedAt ?? new Date() })
      .where(eq(people.id, id));
    return { slug: person.slug, role: person.primaryRole } as const;
  });
  if (!hasSlug(outcome)) return fail(outcome.error ?? "人物操作失败");
  revalidatePerson(outcome.slug, outcome.role, { notify: true });
  return ok();
}

export async function publishPersonEn(id: string): Promise<ActionResult> {
  await requireEditor();
  const outcome = await db.transaction(async (tx) => {
    const person = await lockPerson(tx, id);
    if (!person) return { error: "人物不存在" } as const;
    const problems = publishEnProblems({ bioEn: person.bioEn });
    if (problems.length) return { error: problems.join("；") } as const;
    await tx
      .update(people)
      .set({ statusEn: "published", publishedEnAt: person.publishedEnAt ?? new Date() })
      .where(eq(people.id, id));
    return {
      slug: person.slug,
      role: person.primaryRole,
      isPublic: person.status === "published",
    } as const;
  });
  if (!hasSlug(outcome)) return fail(outcome.error ?? "人物操作失败");
  revalidatePerson(outcome.slug, outcome.role, { notify: outcome.isPublic });
  return ok();
}

export async function unpublishPersonEn(id: string): Promise<ActionResult> {
  await requireEditor();
  const outcome = await db.transaction(async (tx) => {
    const person = await lockPerson(tx, id);
    if (!person) return null;
    await tx.update(people).set({ statusEn: "draft" }).where(eq(people.id, id));
    return { slug: person.slug, role: person.primaryRole, isPublic: person.status === "published" };
  });
  if (!outcome) return fail("人物不存在");
  revalidatePerson(outcome.slug, outcome.role, { notify: outcome.isPublic });
  return ok();
}

export async function unpublishPerson(id: string): Promise<ActionResult> {
  await requireEditor();
  const outcome = await db.transaction(async (tx) => {
    const person = await lockPerson(tx, id);
    if (!person) return null;
    await tx.update(people).set({ status: "draft" }).where(eq(people.id, id));
    return {
      slug: person.slug,
      role: person.primaryRole,
      wasPublic: person.status === "published",
    };
  });
  if (!outcome) return fail("人物不存在");
  revalidatePerson(outcome.slug, outcome.role, { notify: outcome.wasPublic });
  return ok();
}

export async function deletePerson(id: string): Promise<ActionResult> {
  await requireEditor();
  const outcome = await db.transaction(async (tx) => {
    const person = await lockPerson(tx, id);
    if (!person) return { error: "人物不存在" } as const;
    const associated = await tx
      .select({ filmId: filmDirectors.filmId })
      .from(filmDirectors)
      .where(eq(filmDirectors.directorId, id));
    await lockFilms(
      tx,
      associated.map((row) => row.filmId),
    );
    // A save that was already ahead of us may have removed this person
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
        error: `该人物仍以导演身份关联 ${publishedCount} 部已发布影片，请先解除关联或下架这些影片`,
      } as const;
    }
    await tx.delete(people).where(eq(people.id, id));
    return {
      slug: person.slug,
      role: person.primaryRole,
      wasPublic: person.status === "published",
    } as const;
  });
  if ("error" in outcome && outcome.error) return fail(outcome.error);
  revalidatePerson(outcome.slug, outcome.role, { notify: outcome.wasPublic });
  return ok();
}
