import { describe, expect, test } from "bun:test";
import { markInput, mediaFields, roleInput, rowId } from "./action-input";

describe("action inputs", () => {
  test("row ids are trimmed, non-empty and bounded", () => {
    expect(rowId.parse(" abc ")).toBe("abc");
    expect(rowId.safeParse("").success).toBe(false);
    expect(rowId.safeParse("x".repeat(65)).success).toBe(false);
    expect(rowId.safeParse(42).success).toBe(false);
  });

  test("marks accept only the two statuses or null", () => {
    expect(markInput.safeParse({ filmId: "f1", status: "watched" }).success).toBe(true);
    expect(markInput.safeParse({ filmId: "f1", status: null }).success).toBe(true);
    expect(markInput.safeParse({ filmId: "f1", status: "loved" }).success).toBe(false);
  });

  test("roles are an enum, not free text", () => {
    expect(roleInput.safeParse("editor").success).toBe(true);
    expect(roleInput.safeParse("superuser").success).toBe(false);
  });

  test("media sort order is a bounded integer", () => {
    expect(mediaFields.safeParse({ sortOrder: 3 }).success).toBe(true);
    expect(mediaFields.safeParse({ sortOrder: 1.5 }).success).toBe(false);
    expect(mediaFields.safeParse({ sortOrder: -1 }).success).toBe(false);
  });
});
