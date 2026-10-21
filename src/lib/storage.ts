import "server-only";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";
import { nanoid } from "nanoid";
import type { ImageMime, ValidatedImage } from "@/lib/image-upload";

// Extension derives from the validated MIME type, never from the
// client-supplied filename — the public/uploads fallback serves these
// as public assets and must not persist attacker-chosen extensions.
export const EXT_BY_MIME: Record<ImageMime, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

/**
 * Image storage with one switch: Vercel Blob when BLOB_READ_WRITE_TOKEN
 * is set (production), otherwise public/uploads on disk so local dev
 * and tests need no cloud credentials. Both branches return the same
 * shape; `pathname` is what delete needs later.
 */
export type StoredImage = { url: string; pathname: string };

/**
 * Production without a Blob token used to fall through to public/uploads
 * — a read-only filesystem on Vercel, so every upload failed at write
 * time with an opaque EROFS. Refuse up front instead. The e2e suite runs
 * a production build with no Blob credentials and opts in explicitly.
 */
function hasBlob(): boolean {
  if (process.env.BLOB_READ_WRITE_TOKEN) return true;
  if (process.env.NODE_ENV === "production" && !process.env.E2E_ALLOW_LOCAL_STORAGE) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not set");
  }
  return false;
}

/** Pathnames are unique per upload and never overwritten, so the bytes behind a URL never change. */
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

export async function storeImage(image: ValidatedImage, prefix: string): Promise<StoredImage> {
  const ext = EXT_BY_MIME[image.mime];
  const pathname = `${prefix}/${nanoid(10)}${ext}`;

  if (hasBlob()) {
    const blob = await put(pathname, image.bytes, {
      access: "public",
      contentType: image.mime,
      cacheControlMaxAge: ONE_YEAR_SECONDS,
    });
    return { url: blob.url, pathname: blob.pathname };
  }

  const target = path.join(process.cwd(), "public", "uploads", pathname);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, image.bytes);
  return { url: `/uploads/${pathname}`, pathname };
}

export async function deleteImage(pathname: string): Promise<void> {
  if (hasBlob()) {
    await del(pathname);
    return;
  }
  await unlink(path.join(process.cwd(), "public", "uploads", pathname)).catch(() => {});
}
