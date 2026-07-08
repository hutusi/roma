import { describe, expect, test } from "bun:test";
import { directorFormSchema } from "./director";
import { listFormSchema } from "./list";

describe("slug rules are consistent across entities", () => {
  const director = { name: "Federico Fellini" };
  const list = { title: "费里尼入门", sortOrder: "0" };

  test.each(["federico-fellini", "8-and-a-half", "a"])("accepts %s", (slug) => {
    expect(directorFormSchema.safeParse({ ...director, slug }).success).toBe(true);
    expect(listFormSchema.safeParse({ ...list, slug }).success).toBe(true);
  });

  test.each(["Fellini", "费里尼", "with space", "under_score", ""])("rejects %s", (slug) => {
    expect(directorFormSchema.safeParse({ ...director, slug }).success).toBe(false);
    expect(listFormSchema.safeParse({ ...list, slug }).success).toBe(false);
  });
});
