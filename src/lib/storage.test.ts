import { describe, expect, test } from "bun:test";
import { EXT_BY_MIME, storeImage } from "./storage";

describe("EXT_BY_MIME", () => {
  test("covers exactly the four allowed image types", () => {
    expect(Object.keys(EXT_BY_MIME).sort()).toEqual([
      "image/avif",
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);
  });
});

describe("storeImage", () => {
  test("rejects files whose MIME type has no mapping, regardless of filename", async () => {
    // A .jpg filename must not smuggle in a non-image type.
    const svg = new File(["<svg/>"], "innocent.jpg", { type: "image/svg+xml" });
    await expect(storeImage(svg, "media")).rejects.toThrow("Unsupported image type");

    const html = new File(["<html/>"], "still.png", { type: "text/html" });
    await expect(storeImage(html, "media")).rejects.toThrow("Unsupported image type");
  });
});
