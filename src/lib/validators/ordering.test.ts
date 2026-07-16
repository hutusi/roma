import { describe, expect, test } from "bun:test";
import { permutationProblem } from "./ordering";

describe("permutationProblem", () => {
  const current = ["a", "b", "c"];

  test("accepts a reordering of exactly the current items", () => {
    expect(permutationProblem(["c", "a", "b"], current)).toBeNull();
  });

  test("accepts an empty list against no items", () => {
    expect(permutationProblem([], [])).toBeNull();
  });

  // The real regression: the owner's panel used to hide unpublished
  // members, so every drag sent a subset and the hidden rows kept stale
  // positions that collided with the newly assigned ones.
  test("rejects a subset that omits a hidden item", () => {
    expect(permutationProblem(["a", "b"], current)).toBe("incomplete");
  });

  test("rejects duplicates, which would write one row twice and leave a gap", () => {
    expect(permutationProblem(["a", "a", "b"], current)).toBe("duplicate");
  });

  test("rejects ids that aren't in the list, even at the right count", () => {
    expect(permutationProblem(["a", "b", "zzz"], current)).toBe("unknown");
  });

  test("order of currentIds doesn't matter — only membership", () => {
    expect(permutationProblem(["a", "b", "c"], ["c", "b", "a"])).toBeNull();
  });
});
