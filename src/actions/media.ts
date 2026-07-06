"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media, mediaKind } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { deleteImage, storeImage } from "@/lib/storage";
import { fail, ok, type ActionResult } from "./result";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel request-body ceiling is 4.5MB
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function uploadMedia(
  formData: FormData,
): Promise<ActionResult<{ id: string; url: string }>> {
  await requireEditor();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("请选择图片文件");
  if (!IMAGE_TYPES.has(file.type)) return fail("仅支持 JPEG/PNG/WebP/AVIF");
  if (file.size > MAX_UPLOAD_BYTES) return fail("图片不能超过 4MB");

  const kind = String(formData.get("kind") || "still");
  if (!mediaKind.enumValues.includes(kind as (typeof mediaKind.enumValues)[number])) {
    return fail("无效的图片类型");
  }
  const credit = String(formData.get("credit") || "").trim();
  if (!credit) return fail("必须填写图片来源（版权信息）");

  const stored = await storeImage(file, "media");
  const [row] = await db
    .insert(media)
    .values({
      url: stored.url,
      pathname: stored.pathname,
      alt: String(formData.get("alt") || "") || null,
      credit,
      kind: kind as (typeof mediaKind.enumValues)[number],
      filmId: String(formData.get("filmId") || "") || null,
      directorId: String(formData.get("directorId") || "") || null,
    })
    .returning({ id: media.id, url: media.url });
  return ok(row);
}

export async function updateMedia(
  id: string,
  fields: {
    alt?: string;
    credit?: string;
    kind?: string;
    filmId?: string | null;
    directorId?: string | null;
    sortOrder?: number;
  },
): Promise<ActionResult> {
  await requireEditor();
  if (fields.credit !== undefined && !fields.credit.trim()) {
    return fail("图片来源不能为空");
  }
  if (
    fields.kind !== undefined &&
    !mediaKind.enumValues.includes(fields.kind as (typeof mediaKind.enumValues)[number])
  ) {
    return fail("无效的图片类型");
  }
  await db
    .update(media)
    .set({
      ...(fields.alt !== undefined && { alt: fields.alt || null }),
      ...(fields.credit !== undefined && { credit: fields.credit }),
      ...(fields.kind !== undefined && {
        kind: fields.kind as (typeof mediaKind.enumValues)[number],
      }),
      ...(fields.filmId !== undefined && { filmId: fields.filmId }),
      ...(fields.directorId !== undefined && { directorId: fields.directorId }),
      ...(fields.sortOrder !== undefined && { sortOrder: fields.sortOrder }),
    })
    .where(eq(media.id, id));
  return ok();
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  await requireEditor();
  const row = await db.query.media.findFirst({ where: eq(media.id, id) });
  if (!row) return fail("图片不存在");
  await deleteImage(row.pathname);
  await db.delete(media).where(eq(media.id, id));
  return ok();
}
