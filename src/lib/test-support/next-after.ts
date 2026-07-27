import { mock } from "bun:test";

/**
 * The single `next/server` stub for the whole unit suite.
 *
 * `after()` defers work past the response, which a bun test has no request
 * scope for, so it has to be stubbed to observe anything the ping does. The
 * reason that stub lives here rather than inline in each test file is
 * `mock.module`: it is process-global, has no unmock, and on Linux keys the
 * registry by RESOLVED PATH. Two files registering their own `next/server`
 * stub therefore do not get one each — whichever ran first wins, and the
 * second file's `after` writes into the first file's closure while the second
 * awaits its own, permanently-undefined variable.
 *
 * That is not hypothetical. `revalidate.test.ts` used to replace
 * `@/lib/indexnow` wholesale, `indexnow.test.ts` imported the same file as
 * `./indexnow`, and on Linux the two specifiers collapsed to one entry: every
 * assertion in indexnow.test.ts silently saw zero calls. macOS keyed them
 * apart, so the suite was green locally and red in CI for the same commit.
 *
 * Importing this module is what makes the leak harmless: there is one
 * registration and one `pending`, so whichever file triggers it, every reader
 * is looking at the same thing.
 */
/**
 * Every callback, not just the most recent. Keeping a single promise looks
 * adequate while each test schedules one, and silently stops being adequate
 * the moment one schedules two: the earlier callback still runs, but nothing
 * can await it, so its assertions race the test that follows it.
 */
let pending: Promise<unknown>[] = [];

mock.module("next/server", () => ({
  after: (fn: () => Promise<unknown>) => {
    pending.push(Promise.resolve().then(fn));
  },
}));

/**
 * Await every callback `after()` has been handed, or `undefined` if it was
 * never called — which is a meaningful answer, not an empty one, so tests
 * asserting "nothing was deferred" can say so directly. Tests that expect
 * deferred work should assert this is defined before awaiting it: `await
 * undefined` resolves happily and would let the assertion pass vacuously.
 */
export const drainAfter = (): Promise<unknown[]> | undefined =>
  pending.length ? Promise.all(pending) : undefined;

/** Call in `beforeEach`, so one test's deferred work cannot satisfy the next. */
export const resetAfter = (): void => {
  pending = [];
};
