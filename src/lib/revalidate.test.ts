import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { drainAfter, resetAfter } from "./test-support/next-after";

// Capture what the revalidate helpers hand to next/cache without touching
// the real cache. Registered before the dynamic import below so the module
// under test binds to these stubs.
const paths: [string, string?][] = [];
mock.module("next/cache", () => ({
  revalidatePath: (p: string, type?: string) => paths.push([p, type]),
}));

/**
 * This used to replace `@/lib/indexnow` wholesale, which was the neater way
 * to ask "did it notify at all" and also a landmine: `mock.module` is
 * process-global with no unmock, and on Linux it keys by resolved path, so
 * indexnow.test.ts's `import("./indexnow")` picked up this stub and every
 * assertion in that file quietly saw zero calls. Observing the real ping
 * instead costs a fetch stub and asserts URLs rather than paths — which is
 * closer to the thing that matters anyway, since the URL list is what an
 * engine actually receives.
 */
const pinged: string[][] = [];
const realFetch = globalThis.fetch;

const { revalidateFilm, revalidateList, revalidateMedia, revalidatePerson } = await import(
  "./revalidate"
);

/** The zh/en pair pingIndexNow builds for one path, in its order. */
const editions = (path: string) => [
  `https://babuban.com/zh${path === "/" ? "" : path}`,
  `https://babuban.com/en${path === "/" ? "" : path}`,
];

/** What a ping of these paths should put on the wire. */
const expectPinged = (...paths: string[]) => expect(pinged).toEqual([paths.flatMap(editions)]);

beforeEach(() => {
  paths.length = 0;
  pinged.length = 0;
  resetAfter();
  process.env.INDEXNOW_KEY = "cafe1234";
  globalThis.fetch = ((_url: string, init: RequestInit) => {
    pinged.push(JSON.parse(String(init.body)).urlList);
    return Promise.resolve(new Response("ok"));
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.INDEXNOW_KEY;
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

  test("does not notify by default, so a draft-only save can't leak its slug", async () => {
    revalidateFilm("unreleased-draft");
    await drainAfter();
    expect(pinged).toEqual([]);
  });

  test("notifies the film, index, and home when asked", async () => {
    revalidateFilm("solaris", { notify: true });
    await drainAfter();
    expectPinged("/film/solaris", "/films", "/");
  });
});

describe("revalidatePerson", () => {
  test("sweeps the public tree, so film cards carrying the name refresh too", async () => {
    revalidatePerson("tarkovsky", "director");
    expectFullSweep();
    await drainAfter();
    expect(pinged).toEqual([]);
  });

  test("notifies the person page when asked", async () => {
    revalidatePerson("tarkovsky", "director", { notify: true });
    await drainAfter();
    expectPinged("/director/tarkovsky");
  });

  test("an actor-primary person notifies the /actor canonical URL", async () => {
    revalidatePerson("masina", "actor", { notify: true });
    await drainAfter();
    expectPinged("/actor/masina");
  });
});

describe("revalidateList", () => {
  test("sweeps the public tree, so member films' 'appears in' refreshes too", async () => {
    revalidateList("essential-noir");
    expectFullSweep();
    await drainAfter();
    expect(pinged).toEqual([]);
  });

  test("notifies the list, index, and home when asked", async () => {
    revalidateList("essential-noir", { notify: true });
    await drainAfter();
    expectPinged("/list/essential-noir", "/lists", "/");
  });
});

describe("revalidateMedia", () => {
  test("sweeps the public tree but never notifies — media has no URL of its own", async () => {
    revalidateMedia();
    expectFullSweep();
    await drainAfter();
    expect(pinged).toEqual([]);
  });
});
