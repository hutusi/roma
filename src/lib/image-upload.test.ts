import { describe, expect, test } from "bun:test";
import sharp from "sharp";
import { ImageValidationError, validateImageUpload } from "./image-upload";

const fileFrom = (bytes: Buffer, type: string, name = "upload") =>
  new File([new Uint8Array(bytes)], name, { type });

describe("validateImageUpload", () => {
  test("returns verified MIME and dimensions from the bytes", async () => {
    const bytes = await sharp({
      create: { width: 3, height: 2, channels: 3, background: "#000" },
    })
      .png()
      .toBuffer();
    const image = await validateImageUpload(fileFrom(bytes, "image/png"), 1024 * 1024);
    expect(image.mime).toBe("image/png");
    expect(image.width).toBe(3);
    expect(image.height).toBe(2);
    expect(image.bytes.equals(bytes)).toBe(true);
  });

  test("rejects a valid image with a mismatched declared MIME", async () => {
    const bytes = await sharp({
      create: { width: 2, height: 2, channels: 3, background: "#fff" },
    })
      .jpeg()
      .toBuffer();
    await expect(validateImageUpload(fileFrom(bytes, "image/png"), 1024 * 1024)).rejects.toThrow(
      "图片实际格式与文件类型不一致",
    );
  });

  test("rejects non-image bytes even when the browser declares JPEG", async () => {
    const file = new File(["<html>not an image</html>"], "fake.jpg", { type: "image/jpeg" });
    await expect(validateImageUpload(file, 1024 * 1024)).rejects.toBeInstanceOf(
      ImageValidationError,
    );
  });

  test("recognizes AVIF through its container brands", async () => {
    const bytes = await sharp({
      create: { width: 2, height: 2, channels: 3, background: "#f00" },
    })
      .avif()
      .toBuffer();
    const image = await validateImageUpload(fileFrom(bytes, "image/avif"), 1024 * 1024);
    expect(image.mime).toBe("image/avif");
    expect([image.width, image.height]).toEqual([2, 2]);
  });
});
