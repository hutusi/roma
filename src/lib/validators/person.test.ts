import { describe, expect, test } from "bun:test";
import { personFormSchema, publishEnProblems, publishProblems } from "./person";

/**
 * These gates guard what stays live, and until now nothing tested them —
 * the zh gate lived inline in publishPerson, so savePerson never ran
 * it and a published person could be saved with both fields empty.
 */

describe("publishProblems", () => {
  test("accepts a bio alone", () => {
    expect(publishProblems({ bio: "意大利导演。", careerEssay: null })).toEqual([]);
  });

  test("accepts a career essay alone — the bio stays optional", () => {
    const essay = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "意大利导演。" }] }],
    };
    expect(publishProblems({ bio: null, careerEssay: essay })).toEqual([]);
  });

  test("rejects both empty", () => {
    expect(publishProblems({ bio: null, careerEssay: null })).toHaveLength(1);
  });

  test("rejects a careerEssay that renders nothing — an empty doc is not content", () => {
    // Used to pass: a truthy object satisfied the old `|| careerEssay`.
    expect(publishProblems({ bio: null, careerEssay: { type: "doc" } })).toHaveLength(1);
    expect(publishProblems({ bio: null, careerEssay: { type: "doc", content: [] } })).toHaveLength(
      1,
    );
  });

  test("rejects a whitespace-only bio, which is not a bio", () => {
    expect(publishProblems({ bio: "   ", careerEssay: null })).toHaveLength(1);
  });
});

describe("publishEnProblems", () => {
  test("accepts an English bio", () => {
    expect(publishEnProblems({ bioEn: "Italian director." })).toEqual([]);
  });

  test("rejects a missing or whitespace-only English bio", () => {
    expect(publishEnProblems({ bioEn: null })).toHaveLength(1);
    expect(publishEnProblems({ bioEn: "  " })).toHaveLength(1);
  });
});

describe("personFormSchema", () => {
  const base = { slug: "federico-fellini", name: "Federico Fellini", primaryRole: "director" };

  test("a draft needs only a slug, a name and a role — publishing is the strict step", () => {
    expect(personFormSchema.safeParse(base).success).toBe(true);
  });

  test("rejects a slug with uppercase or spaces", () => {
    expect(personFormSchema.safeParse({ ...base, slug: "Federico Fellini" }).success).toBe(false);
  });

  test("rejects an empty name", () => {
    expect(personFormSchema.safeParse({ ...base, name: "" }).success).toBe(false);
  });
});
