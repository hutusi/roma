import { describe, expect, test } from "bun:test";
import { indexHref, likePattern, pageParam } from "./list-kit";

describe("likePattern", () => {
  test("wraps in wildcards and escapes the user's own", () => {
    expect(likePattern("fellini")).toBe("%fellini%");
    expect(likePattern("100%")).toBe("%100\\%%");
    expect(likePattern("a_b")).toBe("%a\\_b%");
    expect(likePattern("c:\\x")).toBe("%c:\\\\x%");
  });
});

describe("pageParam", () => {
  test.each([
    [undefined, 1],
    ["0", 1],
    ["-3", 1],
    ["2.5", 1],
    ["abc", 1],
    ["3", 3],
  ])("%p → %p", (raw, page) => {
    expect(pageParam(raw)).toBe(page);
  });
});

describe("indexHref", () => {
  test("keeps set params, drops empty ones", () => {
    expect(indexHref("/admin/media", {})).toBe("/admin/media");
    expect(indexHref("/admin/media", { filmId: "f1", q: undefined, page: "2" })).toBe(
      "/admin/media?filmId=f1&page=2",
    );
    expect(indexHref("/admin/media", { q: "a b&c" })).toBe("/admin/media?q=a+b%26c");
  });
});
