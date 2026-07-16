import "server-only";
import sharp from "sharp";

export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export type ImageMime = (typeof IMAGE_MIME_TYPES)[number];

const IMAGE_MIME_SET = new Set<string>(IMAGE_MIME_TYPES);

export type ValidatedImage = {
  bytes: Buffer;
  mime: ImageMime;
  width: number;
  height: number;
};

export class ImageValidationError extends Error {}

function isAvifContainer(bytes: Buffer): boolean {
  if (bytes.length < 16 || bytes.toString("ascii", 4, 8) !== "ftyp") return false;
  const boxSize = bytes.readUInt32BE(0);
  if (boxSize < 16) return false;
  const boxEnd = Math.min(boxSize, bytes.length);
  const brands = [bytes.toString("ascii", 8, 12)];
  for (let offset = 16; offset + 4 <= boxEnd; offset += 4) {
    brands.push(bytes.toString("ascii", offset, offset + 4));
  }
  return brands.some((brand) => brand === "avif" || brand === "avis");
}

function detectedMime(format: string | undefined, bytes: Buffer): ImageMime | null {
  if (format === "jpeg") return "image/jpeg";
  if (format === "png") return "image/png";
  if (format === "webp") return "image/webp";
  // libvips reports AVIF and HEIC under the shared HEIF decoder. Inspect
  // the ISO-BMFF brands so an HEIC file cannot be persisted with .avif.
  if (format === "heif" && isAvifContainer(bytes)) return "image/avif";
  return null;
}

/**
 * Reads and verifies an upload once. Storage callers receive trusted bytes,
 * MIME, and dimensions; they never need to trust File.type or re-decode it.
 */
export async function validateImageUpload(file: File, maxBytes: number): Promise<ValidatedImage> {
  if (file.size === 0) throw new ImageValidationError("请选择图片文件");
  if (file.size > maxBytes) {
    const maxMegabytes = maxBytes / (1024 * 1024);
    throw new ImageValidationError(`图片不能超过 ${maxMegabytes}MB`);
  }
  if (!IMAGE_MIME_SET.has(file.type)) {
    throw new ImageValidationError("仅支持 JPEG/PNG/WebP/AVIF");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  let metadata: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    metadata = await sharp(bytes, { failOn: "error", limitInputPixels: 40_000_000 }).metadata();
  } catch {
    throw new ImageValidationError("图片文件已损坏或格式无效");
  }

  const mime = detectedMime(metadata.format, bytes);
  if (!mime) throw new ImageValidationError("仅支持 JPEG/PNG/WebP/AVIF");
  if (mime !== file.type) throw new ImageValidationError("图片实际格式与文件类型不一致");
  if (!metadata.width || !metadata.height) {
    throw new ImageValidationError("无法读取图片尺寸");
  }
  if (metadata.width * metadata.height > 40_000_000) {
    throw new ImageValidationError("图片像素尺寸过大");
  }

  return { bytes, mime, width: metadata.width, height: metadata.height };
}
