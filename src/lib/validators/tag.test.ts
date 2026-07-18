import { describe, expect, test } from "bun:test";
import { tagFormSchema } from "./tag";

describe("tagFormSchema", () => {
  const valid = { slug: "film-noir", nameZh: "黑色电影", nameEn: "Film Noir" };

  test("accepts a complete bilingual tag", () => {
    expect(tagFormSchema.safeParse(valid).success).toBe(true);
  });

  test.each([
    "nameZh",
    "nameEn",
  ] as const)("requires %s — the vocabulary is bilingual by construction", (field) => {
    expect(tagFormSchema.safeParse({ ...valid, [field]: "" }).success).toBe(false);
  });

  test("caps name lengths", () => {
    expect(tagFormSchema.safeParse({ ...valid, nameZh: "标".repeat(31) }).success).toBe(false);
    expect(tagFormSchema.safeParse({ ...valid, nameEn: "x".repeat(61) }).success).toBe(false);
  });

  test("whitespace-only names are rejected — a blank chip is worse than no tag", () => {
    expect(tagFormSchema.safeParse({ ...valid, nameZh: "  " }).success).toBe(false);
    expect(tagFormSchema.safeParse({ ...valid, nameEn: " " }).success).toBe(false);
  });

  test("padded names are stored trimmed", () => {
    const parsed = tagFormSchema.safeParse({ ...valid, nameEn: " Film Noir " });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.nameEn).toBe("Film Noir");
  });
});
