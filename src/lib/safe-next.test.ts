import { describe, expect, test } from "bun:test";
import { safeNextPath, signInHrefFor } from "./safe-next";

describe("safeNextPath", () => {
  test("keeps same-origin paths, with their query", () => {
    expect(safeNextPath("/zh/film/la-strada", "/zh")).toBe("/zh/film/la-strada");
    expect(safeNextPath("/en/search?q=fellini", "/en")).toBe("/en/search?q=fellini");
  });

  test.each([
    ["missing", null],
    ["empty", ""],
    ["relative", "zh/film"],
    ["absolute URL", "https://evil.example/"],
    ["protocol-relative", "//evil.example/"],
    ["backslash", "/\\evil.example/"],
    ["javascript:", "javascript:alert(1)"],
    ["control character", "/zh\n//evil.example"],
  ])("falls back for %s", (_, next) => {
    expect(safeNextPath(next, "/zh")).toBe("/zh");
  });
});

describe("signInHrefFor", () => {
  test("carries the current path, encoded", () => {
    expect(signInHrefFor("/zh/sign-in", "/zh/film/la-strada")).toBe(
      "/zh/sign-in?next=%2Fzh%2Ffilm%2Fla-strada",
    );
  });
  test("drops an unsafe current path", () => {
    expect(signInHrefFor("/zh/sign-in", "//evil.example")).toBe("/zh/sign-in");
  });
  test("carries no next from the auth pages themselves", () => {
    for (const page of [
      "/zh/sign-in",
      "/zh/sign-up",
      "/en/forgot-password",
      "/en/reset-password?token=abc",
    ]) {
      expect(signInHrefFor("/zh/sign-in", page)).toBe("/zh/sign-in");
    }
    // Only whole segments: a page merely named like one keeps its next.
    expect(signInHrefFor("/zh/sign-in", "/zh/list/sign-in-tips")).toBe(
      "/zh/sign-in?next=%2Fzh%2Flist%2Fsign-in-tips",
    );
  });
});
