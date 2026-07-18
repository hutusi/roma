"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { lockFilms, lockTag } from "@/db/locks";
import { films, filmTags, tags } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { revalidateTags } from "@/lib/revalidate";
import { type TagFormValues, tagFormSchema } from "@/lib/validators/tag";
import { type ActionResult, fail, ok } from "./result";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export async function saveTag(
  id: string | null,
  values: TagFormValues,
): Promise<ActionResult<{ id: string }>> {
  await requireEditor();
  const parsed = tagFormSchema.safeParse(values);
  if (!parsed.success) {
    return fail(parsed.error.issues.map((i) => i.message).join("；"));
  }
  const v = parsed.data;

  try {
    const outcome = await db.transaction(async (tx) => {
      if (id) {
        const existing = await lockTag(tx, id);
        if (!existing) return { error: "标签不存在，可能已被删除" } as const;
        await tx.update(tags).set(v).where(eq(tags.id, id));
        return { id } as const;
      }
      const [created] = await tx.insert(tags).values(v).returning({ id: tags.id });
      return { id: created.id } as const;
    });
    if ("error" in outcome && outcome.error) return fail(outcome.error);
    // A rename rewrites every chip that carries the tag; a create touches
    // nothing public yet, but the sweep is cheap and one code path beats
    // two (the corpus philosophy of revalidate.ts).
    revalidateTags();
    return ok({ id: outcome.id });
  } catch (error) {
    if (isUniqueViolation(error)) return fail(`slug「${v.slug}」已被使用`);
    throw error;
  }
}

export async function deleteTag(id: string): Promise<ActionResult> {
  await requireEditor();
  const outcome = await db.transaction(async (tx) => {
    const tag = await lockTag(tx, id);
    if (!tag) return { error: "标签不存在" } as const;
    const attached = await tx
      .select({ filmId: filmTags.filmId })
      .from(filmTags)
      .where(eq(filmTags.tagId, id));
    await lockFilms(
      tx,
      attached.map((row) => row.filmId),
    );
    // A save that was already ahead of us may have detached this tag
    // while we waited for the film locks. Re-read the junction after all
    // locks are held so a no-longer-attached published film cannot cause
    // a false refusal.
    const currentPublished = await tx
      .select({ filmId: filmTags.filmId })
      .from(filmTags)
      .innerJoin(films, eq(filmTags.filmId, films.id))
      .where(and(eq(filmTags.tagId, id), eq(films.status, "published")));
    if (currentPublished.length > 0) {
      return {
        error: `该标签仍关联 ${currentPublished.length} 部已发布影片，请先在影片编辑页移除该标签`,
      } as const;
    }
    // Draft-film junctions go with the tag (cascade) — refusal is only
    // for published pages that would silently change.
    await tx.delete(tags).where(eq(tags.id, id));
    return { deleted: true } as const;
  });
  if ("error" in outcome && outcome.error) return fail(outcome.error);
  revalidateTags();
  return ok();
}
