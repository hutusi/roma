import { describe, expect, test } from "bun:test";
import { counterpartPath, isLocale, localePath } from "./locales";

describe("localePath", () => {
  test("prefixes the locale and collapses the bare root", () => {
    expect(localePath("zh", "/film/x")).toBe("/zh/film/x");
    expect(localePath("en", "/")).toBe("/en");
  });
});

describe("isLocale", () => {
  test("accepts only supported locales", () => {
    expect(isLocale("zh")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("")).toBe(false);
  });
});

describe("counterpartPath", () => {
  test("swaps the locale prefix on any depth", () => {
    expect(counterpartPath("/zh")).toEqual({ target: "en", href: "/en" });
    expect(counterpartPath("/en/film/otto-e-mezzo")).toEqual({
      target: "zh",
      href: "/zh/film/otto-e-mezzo",
    });
    expect(counterpartPath("/zh/films")).toEqual({ target: "en", href: "/en/films" });
  });

  test("returns null off the locale tree", () => {
    expect(counterpartPath("/admin/films")).toBeNull();
    expect(counterpartPath("/")).toBeNull();
    expect(counterpartPath("/fr/x")).toBeNull();
    expect(counterpartPath("/api/rum")).toBeNull();
  });
});
