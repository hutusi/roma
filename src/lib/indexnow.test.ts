import { afterEach, beforeEach, describe, expect, test } from "bun:test";
// Registers the one `next/server` stub for the suite; see that file for why it
// is shared rather than declared inline here. Must be imported before the
// module under test, so that `after` is already stubbed when it binds.
import { drainAfter, resetAfter } from "./test-support/next-after";

const { pingIndexNow } = await import("./indexnow");

const calls: { url: string; body: Record<string, unknown> }[] = [];
const realFetch = globalThis.fetch;
let failFetch = false;

beforeEach(() => {
  resetAfter();
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
  // Guard, not a behaviour test. revalidate.test.ts replaces this module
  // wholesale, mock.module is process-global with no unmock, and on Linux the
  // registry keys by resolved path — so "@/lib/indexnow" and "./indexnow" are
  // one entry and the stub leaks in whenever that file runs first. When that
  // happened the assertions below just saw zero calls, which reads as a broken
  // implementation rather than a poisoned import. This says which it is.
  test("is testing the real module, not a stub left behind by another file", () => {
    expect(pingIndexNow.toString()).toContain("INDEXNOW_KEY");
  });

  test("no-op when INDEXNOW_KEY is unset", () => {
    pingIndexNow(["/film/solaris"]);
    expect(drainAfter()).toBeUndefined();
    expect(calls.length).toBe(0);
  });

  test("pings both locale editions of every path with the key location", async () => {
    process.env.INDEXNOW_KEY = "cafe1234";
    pingIndexNow(["/film/solaris", "/films"]);
    await drainAfter();
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
    await drainAfter(); // would reject if the error escaped the callback
    expect(calls.length).toBe(0);
  });
});
