import { describe, expect, test } from "bun:test";
import { personFormSchema, publishEnProblems, publishProblems } from "./person";

/**
 * These gates guard what stays live, and until now nothing tested them —
 * the zh gate lived inline in publishPerson, so savePerson never ran
 * it and a published person could be saved with both fields empty.
 */

describe("publishProblems", () => {
  test("accepts a bio", () => {
    expect(publishProblems({ bio: "意大利导演。" })).toEqual([]);
  });

  test("rejects a missing bio", () => {
    expect(publishProblems({ bio: null })).toHaveLength(1);
  });

  // This used to pass: the gate was bio OR 创作历程, so a person could go live
  // with no 人物介绍 at all. That field is the card blurb on every listing and
  // the meta description (sliced to 160), so the page looked fine while the
  // listings showed a blank card — and publishEnProblems below already
  // required bioEn, leaving zh the laxer of the two (ADR 0017).
  test("rejects a person carrying only a 创作历程, however long", () => {
    expect(publishProblems({ bio: null, editorialNote: "一段札记。" })).toHaveLength(1);
  });

  test("rejects a whitespace-only bio, which is not a bio", () => {
    expect(publishProblems({ bio: "   " })).toHaveLength(1);
  });

  test("holds the note to its ceiling, and does not require one", () => {
    expect(publishProblems({ bio: "意大利导演。", editorialNote: null })).toEqual([]);
    expect(publishProblems({ bio: "意大利导演。", editorialNote: "字".repeat(401) })).toHaveLength(
      1,
    );
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
