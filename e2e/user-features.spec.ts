import { expect, test } from "@playwright/test";

const activeClass = /bg-brand/;

test.describe("reader", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("marks persist and overwrite; no leakage to another account on the cached page", async ({
    page,
    browser,
  }) => {
    await page.goto("/zh/film/la-strada");
    await page.getByRole("button", { name: "看过" }).click();
    await page.waitForTimeout(1000);
    await page.reload();
    await expect(page.getByRole("button", { name: "看过" })).toHaveClass(activeClass, {
      timeout: 10_000,
    });

    await page.getByRole("button", { name: "想看" }).click();
    await page.waitForTimeout(1000);
    await page.reload();
    await expect(page.getByRole("button", { name: "想看" })).toHaveClass(activeClass, {
      timeout: 10_000,
    });
    await expect(page.getByRole("button", { name: "看过" })).not.toHaveClass(activeClass);

    // Same (SSG-cached) page through a different account: no marks.
    const other = await browser.newContext({ storageState: "e2e/.auth/admin.json" });
    const otherPage = await other.newPage();
    await otherPage.goto("/zh/film/la-strada");
    await expect(otherPage.getByRole("button", { name: "看过" })).toBeVisible();
    await expect(otherPage.getByRole("button", { name: "看过" })).not.toHaveClass(activeClass);
    await expect(otherPage.getByRole("button", { name: "想看" })).not.toHaveClass(activeClass);
    await other.close();
  });

  test("profile tab reflects the want mark", async ({ page }) => {
    await page.goto("/zh/u/e2euser?tab=want");
    await expect(page.locator('a[href="/zh/film/la-strada"]')).toBeVisible();
  });

  test("follow shows up in /me/follows", async ({ page }) => {
    await page.goto("/zh/list/fellini-primer");
    await page.getByRole("button", { name: "关注片单" }).click();
    await page.waitForTimeout(1000);
    await page.goto("/zh/me/follows");
    await expect(page.locator('a[href="/zh/list/fellini-primer"]')).toBeVisible();
  });

  test("user list: created, filled, and readable by others without the owner panel", async ({
    page,
    browser,
  }) => {
    await page.goto("/zh/u/e2euser?tab=lists");
    await page.getByRole("button", { name: "新建片单" }).click();
    await page.fill("#title", "我的黑白十佳");
    await page.getByRole("button", { name: "创建", exact: true }).click();
    await page.waitForURL(/\/u\/e2euser\/list\/[^/]+$/);
    const listUrl = page.url();

    await page.locator("select").first().selectOption({ label: "大路（1954）" });
    await page.getByRole("button", { name: "加入" }).click();
    await expect(page.locator('a[href^="/zh/film/"]').first()).toBeVisible({ timeout: 15_000 });

    const stranger = await browser.newContext({ storageState: "e2e/.auth/admin.json" });
    const strangerPage = await stranger.newPage();
    await strangerPage.goto(listUrl);
    await expect(strangerPage.getByText("我的黑白十佳")).toBeVisible();
    await expect(strangerPage.getByText("这是你的片单")).toHaveCount(0);
    await stranger.close();
  });
});

test.describe("guest", () => {
  test("sees sign-in hints instead of interactive buttons", async ({ page }) => {
    await page.goto("/zh/film/la-strada");
    await expect(page.getByText("登录后可标记")).toBeVisible();
    await page.goto("/zh/me/follows");
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
