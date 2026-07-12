import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

// `after` defers work past the response; the stub runs the callback on a
// microtask and exposes the promise so tests can await completion.
let deferred: Promise<unknown> | undefined;
mock.module("next/server", () => ({
  after: (fn: () => Promise<unknown>) => {
    deferred = Promise.resolve().then(fn);
  },
}));

const { pingIndexNow } = await import("./indexnow");

const calls: { url: string; body: Record<string, unknown> }[] = [];
const realFetch = globalThis.fetch;
let failFetch = false;

beforeEach(() => {
  deferred = undefined;
  calls.length = 0;
  failFetch = false;
  globalThis.fetch = ((url: string, init: RequestInit) => {
    if (failFetch) return Promise.reject(new Error("engine down"));
    calls.push({ url: String(url), body: JSON.parse(String(init.body)) });
    return Promise.resolve(new Response("ok"));
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.INDEXNOW_KEY;
});

describe("pingIndexNow", () => {
  test("no-op when INDEXNOW_KEY is unset", () => {
    pingIndexNow(["/film/solaris"]);
    expect(deferred).toBeUndefined();
    expect(calls.length).toBe(0);
  });

  test("pings both locale editions of every path with the key location", async () => {
    process.env.INDEXNOW_KEY = "cafe1234";
    pingIndexNow(["/film/solaris", "/films"]);
    await deferred;
    expect(calls.length).toBe(1);
    const { url, body } = calls[0];
    expect(url).toBe("https://api.indexnow.org/indexnow");
    expect(body.host).toBe("babuban.com");
    expect(body.key).toBe("cafe1234");
    expect(body.keyLocation).toBe("https://babuban.com/indexnow-key.txt");
    expect(body.urlList).toEqual([
      "https://babuban.com/zh/film/solaris",
      "https://babuban.com/en/film/solaris",
      "https://babuban.com/zh/films",
      "https://babuban.com/en/films",
    ]);
  });

  test("swallows network failures — publish must not fail on a ping", async () => {
    process.env.INDEXNOW_KEY = "cafe1234";
    failFetch = true;
    pingIndexNow(["/list/noir"]);
    await deferred; // would reject if the error escaped the callback
    expect(calls.length).toBe(0);
  });
});
