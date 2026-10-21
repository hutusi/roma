import { expect, test } from "@playwright/test";
import { asFreshClient } from "./utils/client-ip";

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

test.describe("sign-in", () => {
  test.beforeEach(({ page }) => asFreshClient(page));

  test("an empty submit explains each field, in the page's language", async ({ page }) => {
    await page.goto("/en/sign-in");
    await page.getByRole("button", { name: "Sign in" }).click();
    const email = page.getByLabel("Email");
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#email-error")).toHaveText("Please fill this in.");
    await expect(email).toBeFocused();
  });

  test("a wrong password gets a localized message, not better-auth's English", async ({ page }) => {
    await page.goto("/zh/sign-in");
    await page.fill("#email", "user@e2e.test");
    await page.fill("#password", "not-the-password");
    await page.getByRole("button", { name: "登录" }).click();
    // Scoped to main: Next's route announcer is also role="alert".
    await expect(page.getByRole("main").getByRole("alert")).toHaveText("邮箱或密码不正确。");
  });

  test("signing in from a film page comes back to it", async ({ page }) => {
    await page.goto("/zh/film/otto-e-mezzo");
    await page.getByRole("link", { name: "登录后可标记「看过 / 想看」" }).click();
    await expect(page).toHaveURL(/\/zh\/sign-in\?next=%2Fzh%2Ffilm%2Fotto-e-mezzo$/);
    await page.fill("#email", "user@e2e.test");
    await page.fill("#password", "e2e-user-password");
    await page.getByRole("button", { name: "登录" }).click();
    await expect(page).toHaveURL(/\/zh\/film\/otto-e-mezzo$/);
    await expect(page.getByRole("button", { name: "看过" })).toBeVisible();
  });
});

test.describe("failed reads", () => {
  test.describe("as a signed-in reader", () => {
    test.use({ storageState: "e2e/.auth/user.json" });

    test("a failed session read never asks a signed-in reader to sign in", async ({ page }) => {
      let failing = true;
      await page.route("**/api/me/state**", (route) =>
        failing ? route.fulfill({ status: 503, body: "" }) : route.continue(),
      );
      await page.goto("/zh/film/otto-e-mezzo");
      const retry = page.getByRole("button", { name: "暂时无法读取标记，点此重试" });
      await expect(retry).toBeVisible();
      await expect(page.getByText("登录后可标记")).toHaveCount(0);

      failing = false;
      await retry.click();
      await expect(page.getByRole("button", { name: "看过" })).toBeVisible();
    });
  });

  test("search says when its index fails, and typing again retries", async ({ page }) => {
    let failing = true;
    await page.route("**/zh/search-index.json", (route) =>
      failing ? route.abort("failed") : route.continue(),
    );
    await page.goto("/zh/about");
    await page.getByRole("banner").getByRole("button", { name: "搜索" }).click();
    const input = page.getByRole("dialog").getByRole("searchbox", { name: "搜索" });
    await input.fill("费里");
    await expect(page.getByRole("dialog")).toContainText("搜索暂不可用，请稍后再试。");

    failing = false;
    await input.pressSequentially("尼");
    await expect(
      page.getByRole("dialog").locator('a[href="/zh/director/federico-fellini"]'),
    ).toBeVisible();
  });
});
