import type { Page } from "@playwright/test";

/**
 * Resolves when the page's next server-action round trip succeeds.
 * Matched on the Next-Action header, not on "any POST": the RUM beacon
 * also POSTs (on a random sample of page loads), and a test that caught
 * it navigated away before the action had landed — a flake that showed
 * up roughly as often as the sample rate.
 */
export const serverActionDone = (page: Page) =>
  page.waitForResponse(
    (r) =>
      r.request().method() === "POST" &&
      r.request().headers()["next-action"] !== undefined &&
      r.ok(),
  );
