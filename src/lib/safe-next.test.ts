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
});
