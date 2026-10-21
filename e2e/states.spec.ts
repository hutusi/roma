import { expect, test } from "@playwright/test";

/**
 * The states between content: missing pages, failures, nothing to show.
 * None of them may be a dead end.
 */

test.describe("404", () => {
  for (const path of [
    "/foo",
    "/foo/bar",
    "/zh-TW/film/x",
    "/zh/no-such-page",
    "/en/film/no-such-film",
  ]) {
    test(`${path} is a styled 404 with a way home`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(404);
      await expect(page.getByRole("banner")).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        path.startsWith("/en") ? "Lost to time" : "此片散佚",
      );
      const home = page.getByRole("link", {
        name: path.startsWith("/en") ? "Back to the home page" : "回到首页",
      });
      await expect(home).toHaveAttribute("href", path.startsWith("/en") ? "/en" : "/zh");
    });
  }
});
