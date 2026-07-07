import "server-only";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";
import { nanoid } from "nanoid";

// Extension derives from the validated MIME type, never from the
// client-supplied filename — the public/uploads fallback serves these
// as public assets and must not persist attacker-chosen extensions.
const EXT_BY_MIME: Record<string, string> = {
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

const hasBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export async function storeImage(file: File, prefix: string): Promise<StoredImage> {
  const ext = EXT_BY_MIME[file.type];
  if (!ext) throw new Error(`Unsupported image type: ${file.type}`);
  const pathname = `${prefix}/${nanoid(10)}${ext}`;

  if (hasBlob()) {
    const blob = await put(pathname, file, { access: "public" });
    return { url: blob.url, pathname: blob.pathname };
  }

  const target = path.join(process.cwd(), "public", "uploads", pathname);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${pathname}`, pathname };
}

export async function deleteImage(pathname: string): Promise<void> {
  if (hasBlob()) {
    await del(pathname);
    return;
  }
  await unlink(path.join(process.cwd(), "public", "uploads", pathname)).catch(() => {});
}
