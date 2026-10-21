import type { Page } from "@playwright/test";

let next = 0;

/**
 * Presents a client address no other test uses. better-auth rate-limits
 * sign-in, sign-up and password reset per IP (counters in Postgres), and
 * every browser test comes from localhost, so tests that sign in through
 * the UI would throttle each other. The limiter itself stays on.
 */
export async function asFreshClient(page: Page) {
  next += 1;
  const host = (process.pid % 200) + 1;
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `198.51.${host}.${(next % 250) + 1}` });
}
