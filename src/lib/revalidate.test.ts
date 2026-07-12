import { beforeEach, describe, expect, mock, test } from "bun:test";

// Capture what the revalidate helpers hand to next/cache without touching
// the real cache. Registered before the dynamic import below so the module
// under test binds to these stubs.
const tags: string[] = [];
const paths: string[] = [];
mock.module("next/cache", () => ({
  updateTag: (t: string) => tags.push(t),
  revalidatePath: (p: string) => paths.push(p),
}));

// The IndexNow ping has its own tests (indexnow.test.ts); here we only
// assert each helper reports the pages it touched.
const pinged: string[][] = [];
mock.module("@/lib/indexnow", () => ({
  pingIndexNow: (p: string[]) => pinged.push(p),
}));

const { revalidateDirector, revalidateFilm, revalidateList } = await import("./revalidate");

beforeEach(() => {
  tags.length = 0;
  paths.length = 0;
  pinged.length = 0;
});

/** Every base path must be revalidated under BOTH the /zh and /en prefixes. */
function expectBothLocales(basePaths: string[]) {
  for (const base of basePaths) {
    for (const prefix of ["/zh", "/en"]) {
      expect(paths).toContain(base === "/" ? prefix : `${prefix}${base}`);
    }
  }
}

function expectTags(expected: string[]) {
  for (const t of expected) expect(tags).toContain(t);
}

describe("revalidateFilm", () => {
  test("invalidates the film, index, feed, and home in both locales", () => {
    revalidateFilm("solaris");
    expectBothLocales(["/film/solaris", "/films", "/rss.xml", "/"]);
    expectTags(["film:solaris", "films", "home"]);
    expect(pinged).toEqual([["/film/solaris", "/films"]]);
  });
});

describe("revalidateDirector", () => {
  test("invalidates the director page in both locales", () => {
    revalidateDirector("tarkovsky");
    expectBothLocales(["/director/tarkovsky"]);
    expectTags(["director:tarkovsky"]);
    expect(pinged).toEqual([["/director/tarkovsky"]]);
  });
});

describe("revalidateList", () => {
  test("invalidates the list, index, and home in both locales", () => {
    revalidateList("essential-noir");
    expectBothLocales(["/list/essential-noir", "/lists", "/"]);
    expectTags(["list:essential-noir", "lists", "home"]);
    expect(pinged).toEqual([["/list/essential-noir", "/lists"]]);
  });
});
