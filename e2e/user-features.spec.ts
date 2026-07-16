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

  // When an editor pulls a film, the owner's copy used to vanish from
  // their own panel while the row stayed in the table: they couldn't
  // remove it, and every later drag sent a partial permutation that
  // silently collided positions.
  test("user list: an unpublished member becomes a removable placeholder for its owner", async ({
    page,
    browser,
  }) => {
    // A throwaway film — unpublishing a seeded one would race the specs
    // that assert it renders.
    const admin = await browser.newContext({ storageState: "e2e/.auth/admin.json" });
    const adminPage = await admin.newPage();
    await adminPage.goto("/admin/films/new");
    await adminPage.fill("#titleZh", "临时成员");
    await adminPage.fill("#titleOriginal", "Temp Member");
    await adminPage.fill("#slug", "temp-unpublish-member");
    await adminPage.fill("#year", "1975");
    await adminPage.getByLabel("费德里科·费里尼").check();
    await adminPage.locator('textarea[name="editorialNote"]').fill("字".repeat(220));
    await adminPage.click("button[type=submit]");
    await adminPage.waitForURL(/\/admin\/films\/(?!new)[^/]+$/);
    const filmAdminUrl = adminPage.url();
    await adminPage.getByRole("button", { name: "发布", exact: true }).click();
    await expect(adminPage.locator("[data-sonner-toast]", { hasText: "已发布" })).toBeVisible();

    await page.goto("/zh/u/e2euser?tab=lists");
    await page.getByRole("button", { name: "新建片单" }).click();
    await page.fill("#title", "下架测试片单");
    await page.getByRole("button", { name: "创建", exact: true }).click();
    await page.waitForURL(/\/u\/e2euser\/list\/[^/]+$/);
    const listUrl = page.url();

    // The owner panel has no success toast — it just refreshes, so wait
    // on the rendered card instead.
    for (const [label, slug] of [
      ["临时成员（1975）", "temp-unpublish-member"],
      ["大路（1954）", "la-strada"],
    ]) {
      await page.locator("select").first().selectOption({ label });
      await page.getByRole("button", { name: "加入" }).click();
      await expect(page.locator(`a[href="/zh/film/${slug}"]`)).toBeVisible({ timeout: 15_000 });
    }

    await adminPage.goto(filmAdminUrl);
    await adminPage.getByRole("button", { name: "撤回", exact: true }).click();
    await expect(adminPage.locator("[data-sonner-toast]").last()).toBeVisible();

    await page.goto(listUrl);
    // The owner sees it as unavailable — with no title, since it's
    // unpublished editorial work and they aren't an editor.
    await expect(page.getByText("该影片暂不可用（已下架）")).toBeVisible();
    await expect(page.getByText("临时成员")).toHaveCount(0);
    // The still-published member is untouched.
    await expect(page.locator('a[href="/zh/film/la-strada"]')).toBeVisible();

    // And they can get unstuck: the row carries its own remove button
    // (SortableList rows are divs, so scope to the row, not an <li>).
    await page
      .locator("div.border-line", { hasText: "该影片暂不可用（已下架）" })
      .getByRole("button", { name: "移除" })
      .click();
    await expect(page.getByText("该影片暂不可用（已下架）")).toHaveCount(0);
    // Removing the placeholder must not take the good member with it.
    await expect(page.locator('a[href="/zh/film/la-strada"]')).toBeVisible();
    await admin.close();
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
