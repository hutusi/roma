import { expect, test } from "@playwright/test";
import { queryOne } from "./utils/db";

// User-level i18n: locale captured at sign-up, editable in /account,
// and the browser-language hint banner. The suite's default context
// locale is fr-FR (playwright.config) so the banner stays out of every
// other spec; tests here opt in via test.use({ locale }).

test("sign-up from /en seeds the stored locale", async ({ page }) => {
  await page.goto("/en/sign-up");
  await page.fill("#name", "Locale Probe");
  await page.fill("#username", "localeprobe");
  await page.fill("#email", "locale-probe@e2e.test");
  await page.fill("#password", "locale-probe-password");
  await page.click("button[type=submit]");
  await page.waitForURL(/\/en$/);

  const row = await queryOne<{ locale: string | null }>(
    "SELECT locale FROM users WHERE email = $1",
    ["locale-probe@e2e.test"],
  );
  expect(row?.locale).toBe("en");
});

test.describe("account language preference", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("changing the language persists and moves to that locale", async ({ page }) => {
    await page.goto("/zh/account");
    await page.selectOption("#locale", "en");
    await page.getByRole("button", { name: "保存资料" }).click();
    await page.waitForURL(/\/en\/account/);
    await expect(page.getByRole("heading", { name: "Account settings" })).toBeVisible();

    const row = await queryOne<{ locale: string | null }>(
      "SELECT locale FROM users WHERE email = $1",
      ["user@e2e.test"],
    );
    expect(row?.locale).toBe("en");

    // Switch back and restore the fixture invariant (NULL = the
    // pre-column population every other spec assumes).
    await page.selectOption("#locale", "zh");
    await page.getByRole("button", { name: "Save profile" }).click();
    await page.waitForURL(/\/zh\/account/);
    await queryOne("UPDATE users SET locale = NULL WHERE email = $1", ["user@e2e.test"]);
  });
});

test.describe("language-hint banner", () => {
  test.describe("English browser on /zh", () => {
    test.use({ locale: "en-US" });

    test("shows once, links the counterpart, and dismissal survives reload", async ({ page }) => {
      await page.goto("/zh");
      const banner = page.getByText("This page is available in English.");
      await expect(banner).toBeVisible();
      await expect(page.locator('a[href="/en"]', { hasText: "Read in English" })).toBeVisible();

      await page.getByRole("button", { name: "Dismiss" }).click();
      await expect(banner).toHaveCount(0);
      await page.reload();
      await expect(page.getByText("This page is available in English.")).toHaveCount(0);
    });

    test("does not show on the matching locale", async ({ page }) => {
      await page.goto("/en");
      await expect(page.getByText("This page is available in English.")).toHaveCount(0);
      await expect(page.getByText("本页有中文版。")).toHaveCount(0);
    });
  });

  test.describe("Chinese browser on /en", () => {
    test.use({ locale: "zh-CN" });

    test("shows the zh hint on /en only", async ({ page }) => {
      await page.goto("/en/about");
      await expect(page.getByText("本页有中文版。")).toBeVisible();
      await expect(page.locator('a[href="/zh/about"]', { hasText: "阅读中文版" })).toBeVisible();

      await page.goto("/zh/about");
      await expect(page.getByText("本页有中文版。")).toHaveCount(0);
    });
  });

  test.describe("signed-in stored locale wins over the browser", () => {
    test.use({ locale: "en-US", storageState: "e2e/.auth/user.json" });

    test("no banner when the stored preference matches the current edition", async ({ page }) => {
      await queryOne("UPDATE users SET locale = 'zh' WHERE email = $1", ["user@e2e.test"]);
      await page.goto("/zh");
      // Give the session-dependent banner logic a beat to settle, then
      // assert absence.
      await page.waitForTimeout(1000);
      await expect(page.getByText("This page is available in English.")).toHaveCount(0);
      await queryOne("UPDATE users SET locale = NULL WHERE email = $1", ["user@e2e.test"]);
    });
  });
});
