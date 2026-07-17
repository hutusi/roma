import { describe, expect, test } from "bun:test";
import { EXT_BY_MIME } from "./storage";

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
