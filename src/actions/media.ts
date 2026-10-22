"use server";

import { type AnyColumn, eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { curatedListItems, curatedLists, films, media, mediaKind, people } from "@/db/schema";
import { requireEditorResult } from "@/lib/auth-guards";
import { ImageValidationError, type ValidatedImage, validateImageUpload } from "@/lib/image-upload";
import { revalidateMedia } from "@/lib/revalidate";
import { deleteImage, type StoredImage, storeImage } from "@/lib/storage";
import { mediaFields, optionalRowId, rowId } from "@/lib/validators/action-input";
import { type ActionResult, fail, failWith, isForeignKeyViolation, ok } from "./result";

/** A form value as a row id, or null when blank; undefined when malformed. */
function formId(value: FormDataEntryValue | null): string | null | undefined {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;
  const parsed = optionalRowId.safeParse(raw);
  return parsed.success ? parsed.data : undefined;
}

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel request-body ceiling is 4.5MB

export async function uploadMedia(
  formData: FormData,
): Promise<ActionResult<{ id: string; url: string }>> {
  const guarded = await requireEditorResult();
  if (!guarded.ok) return fail(guarded.error);
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("请选择图片文件");

  let image: ValidatedImage;
  try {
    image = await validateImageUpload(file, MAX_UPLOAD_BYTES);
  } catch (error) {
    if (error instanceof ImageValidationError) return fail(error.message);
    throw error;
  }

  const kind = String(formData.get("kind") || "still");
  if (!mediaKind.enumValues.includes(kind as (typeof mediaKind.enumValues)[number])) {
    return fail("无效的图片类型");
  }
  const credit = String(formData.get("credit") || "").trim();
  if (!credit) return fail("必须填写图片来源（版权信息）");
  if (credit.length > 500) return fail("图片来源过长");
  const alt =
    String(formData.get("alt") || "")
      .trim()
      .slice(0, 500) || null;
  const filmId = formId(formData.get("filmId"));
  const personId = formId(formData.get("personId"));
  if (filmId === undefined || personId === undefined) return fail("关联的影片或人物无效");

  let stored: StoredImage;
  try {
    stored = await storeImage(image, "media");
  } catch (error) {
    return failWith("图片上传失败，请稍后重试", error, "uploadMedia");
  }
  let row: { id: string; url: string };
  try {
    [row] = await db
      .insert(media)
      .values({
        url: stored.url,
        pathname: stored.pathname,
        alt,
        credit,
        width: image.width,
        height: image.height,
        dominantColor: image.dominantColor,
        kind: kind as (typeof mediaKind.enumValues)[number],
        filmId,
        personId,
      })
      .returning({ id: media.id, url: media.url });
  } catch (error) {
    // The blob is already stored; without the row nothing will ever
    // reference it, and nothing else knows its pathname to clean it up.
    await deleteImage(stored.pathname).catch(() => {});
    if (isForeignKeyViolation(error)) return fail("关联的影片或人物已不存在");
    return failWith("图片保存失败，请稍后重试", error, "uploadMedia");
  }
  revalidateMedia();
  return ok(row);
}

export async function updateMedia(
  id: string,
  fields: {
    alt?: string;
    credit?: string;
    kind?: string;
    filmId?: string | null;
    personId?: string | null;
    sortOrder?: number;
  },
): Promise<ActionResult> {
  const guarded = await requireEditorResult();
  if (!guarded.ok) return fail(guarded.error);
  if (!rowId.safeParse(id).success) return fail("图片不存在");
  const parsed = mediaFields.safeParse(fields);
  if (!parsed.success) return fail("提交的内容无效");
  fields = parsed.data;
  if (fields.credit !== undefined && !fields.credit.trim()) {
    return fail("图片来源不能为空");
  }
  if (
    fields.kind !== undefined &&
    !mediaKind.enumValues.includes(fields.kind as (typeof mediaKind.enumValues)[number])
  ) {
    return fail("无效的图片类型");
  }
  let updated: { id: string }[];
  try {
    updated = await db
      .update(media)
      .set({
        ...(fields.alt !== undefined && { alt: fields.alt || null }),
        ...(fields.credit !== undefined && { credit: fields.credit.trim() }),
        ...(fields.kind !== undefined && {
          kind: fields.kind as (typeof mediaKind.enumValues)[number],
        }),
        ...(fields.filmId !== undefined && { filmId: fields.filmId }),
        ...(fields.personId !== undefined && { personId: fields.personId }),
        ...(fields.sortOrder !== undefined && { sortOrder: fields.sortOrder }),
      })
      .where(eq(media.id, id))
      .returning({ id: media.id });
  } catch (error) {
    if (isForeignKeyViolation(error)) return fail("关联的影片或人物已不存在");
    return failWith("保存失败，请稍后重试", error, "updateMedia");
  }
  // No pre-fetch here (unlike deleteMedia), so the affected-row count is
  // the existence check: a deleted id matches nothing and must not
  // report success.
  if (!updated.length) return fail("图片不存在");
  revalidateMedia();
  return ok();
}

/**
 * Every essay, in either edition and drafts included, that embeds this
 * image, named for the editor. Essays store an image by its URL, so a
 * deleted library row left them drawing it uncredited (their credit is
 * looked up from the row at render time) or, once the blob was gone, a
 * broken frame on a published page.
 */
async function essaysUsing(url: string): Promise<string[]> {
  const embeds = (column: AnyColumn) => sql`strpos(${column}::text, ${url}) > 0`;
  const [filmRows, personRows, listRows, itemRows] = await Promise.all([
    db
      .select({ title: films.titleZh })
      .from(films)
      .where(or(embeds(films.essay), embeds(films.essayEn))),
    db
      .select({ name: people.name, nameZh: people.nameZh })
      .from(people)
      .where(or(embeds(people.careerEssay), embeds(people.careerEssayEn))),
    db
      .select({ title: curatedLists.title })
      .from(curatedLists)
      .where(or(embeds(curatedLists.intro), embeds(curatedLists.introEn))),
    db
      .selectDistinct({ title: curatedLists.title })
      .from(curatedListItems)
      .innerJoin(curatedLists, eq(curatedListItems.listId, curatedLists.id))
      .where(or(embeds(curatedListItems.reasoning), embeds(curatedListItems.reasoningEn))),
  ]);
  return [
    ...filmRows.map((f) => `《${f.title}》`),
    ...personRows.map((p) => p.nameZh ?? p.name),
    ...[...listRows, ...itemRows].map((l) => `片单「${l.title}」`),
  ];
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  const guarded = await requireEditorResult();
  if (!guarded.ok) return fail(guarded.error);
  if (!rowId.safeParse(id).success) return fail("图片不存在");
  const row = await db.query.media.findFirst({ where: eq(media.id, id) });
  if (!row) return fail("图片不存在");
  const usedBy = [...new Set(await essaysUsing(row.url))];
  if (usedBy.length) {
    return fail(`这张图片仍在长文中使用：${usedBy.join("、")}。请先从长文中移除，再删除。`);
  }
  // Row first, blob second: an orphaned blob is invisible garbage, but
  // a surviving row pointing at a deleted blob renders broken images.
  await db.delete(media).where(eq(media.id, id));
  // Cached pages still carry the old <img src>, so the pages must be
  // invalidated before the bytes go away — otherwise the ordering above
  // buys nothing and readers get the broken image it was avoiding.
  revalidateMedia();
  try {
    await deleteImage(row.pathname);
  } catch (error) {
    // The image is gone from the site either way; a failed blob delete
    // only leaves an unreferenced file behind. Log it for cleanup rather
    // than tell the editor a completed delete failed.
    console.error(`[action:deleteMedia] orphaned blob ${row.pathname}`, error);
  }
  return ok();
}
