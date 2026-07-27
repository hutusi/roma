import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test";
// Hoisted above the mock.module calls below, so this namespace is the real
// module — which is what makes the restore in afterAll possible.
import * as realIndexNow from "@/lib/indexnow";

// Capture what the revalidate helpers hand to next/cache without touching
// the real cache. Registered before the dynamic import below so the module
// under test binds to these stubs.
const paths: [string, string?][] = [];
mock.module("next/cache", () => ({
  revalidatePath: (p: string, type?: string) => paths.push([p, type]),
}));

// The IndexNow ping has its own tests (indexnow.test.ts); here we only
// assert whether each helper notifies at all.
const pinged: string[][] = [];
mock.module("@/lib/indexnow", () => ({
  pingIndexNow: (p: string[]) => pinged.push(p),
}));

/**
 * mock.module is process-global and has no unmock, so this stub outlives
 * the file. On Linux the registry keys by resolved path, which means
 * indexnow.test.ts's `import("./indexnow")` resolved to this same entry and
 * got the stub — its `pingIndexNow` records a call and never reaches
 * `after()` or `fetch`, so every assertion there saw zero calls. macOS keyed
 * the two specifiers apart and the suite stayed green, so this only ever
 * failed in CI, and only once a new test file shifted the discovery order
 * enough to put revalidate.test.ts first.
 */
afterAll(() => {
  mock.module("@/lib/indexnow", () => realIndexNow);
});

const { revalidateFilm, revalidateList, revalidateMedia, revalidatePerson } = await import(
  "./revalidate"
);

beforeEach(() => {
  paths.length = 0;
  pinged.length = 0;
});

/**
 * The whole public tree, however the edit reached it. Asserting the sweep
 * rather than a per-entity path list is the point: the entity→page map
 * this replaced passed its own tests while leaking stale pages on every
 * cross-entity edge it forgot.
 */
function expectFullSweep() {
  // Dynamic segment ⇒ the "layout" type is required, and "/[lang]" rather
  // than "/" because this app has no root layout for "/" to match.
  expect(paths).toContainEqual(["/[lang]", "layout"]);
  // Outside the [lang] tree — the sweep above never reaches it.
  expect(paths).toContainEqual(["/sitemap.xml", undefined]);
  // Route handlers need their own path.
  expect(paths).toContainEqual(["/zh/rss.xml", undefined]);
  expect(paths).toContainEqual(["/en/rss.xml", undefined]);
  expect(paths).toContainEqual(["/zh/search-index.json", undefined]);
  expect(paths).toContainEqual(["/en/search-index.json", undefined]);
}

describe("revalidateFilm", () => {
  test("sweeps the public tree", () => {
    revalidateFilm("solaris");
    expectFullSweep();
  });

  test("does not notify by default, so a draft-only save can't leak its slug", () => {
    revalidateFilm("unreleased-draft");
    expect(pinged).toEqual([]);
  });

  test("notifies the film, index, and home when asked", () => {
    revalidateFilm("solaris", { notify: true });
    expect(pinged).toEqual([["/film/solaris", "/films", "/"]]);
  });
});

describe("revalidatePerson", () => {
  test("sweeps the public tree, so film cards carrying the name refresh too", () => {
    revalidatePerson("tarkovsky", "director");
    expectFullSweep();
    expect(pinged).toEqual([]);
  });

  test("notifies the person page when asked", () => {
    revalidatePerson("tarkovsky", "director", { notify: true });
    expect(pinged).toEqual([["/director/tarkovsky"]]);
  });

  test("an actor-primary person notifies the /actor canonical URL", () => {
    revalidatePerson("masina", "actor", { notify: true });
    expect(pinged).toEqual([["/actor/masina"]]);
  });
});

describe("revalidateList", () => {
  test("sweeps the public tree, so member films' 'appears in' refreshes too", () => {
    revalidateList("essential-noir");
    expectFullSweep();
    expect(pinged).toEqual([]);
  });

  test("notifies the list, index, and home when asked", () => {
    revalidateList("essential-noir", { notify: true });
    expect(pinged).toEqual([["/list/essential-noir", "/lists", "/"]]);
  });
});

describe("revalidateMedia", () => {
  test("sweeps the public tree but never notifies — media has no URL of its own", () => {
    revalidateMedia();
    expectFullSweep();
    expect(pinged).toEqual([]);
  });
});
