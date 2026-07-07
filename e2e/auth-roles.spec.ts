import { expect, test } from "@playwright/test";
import { queryOne } from "./utils/db";

test.describe("signed out", () => {
  test("/admin redirects to sign-in with next param", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fadmin/);
  });
});

test.describe("plain user", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("is bounced from /admin to the home page", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("admin", () => {
  test.use({ storageState: "e2e/.auth/admin.json" });

  test("reaches the dashboard with counts", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("h1")).toHaveText("仪表盘");
    await expect(page.getByText("草稿").first()).toBeVisible();
  });

  test("invite flow: guest becomes editor with editor-scoped access", async ({
    page,
    browser,
  }) => {
    await page.goto("/admin/invites");
    await page.fill('input[type="email"]', "guest@e2e.test");
    await page.getByRole("button", { name: "创建邀请" }).click();
    await expect(page.locator("[data-sonner-toast]").last()).toBeVisible();

    const invite = await queryOne<{ token: string }>(
      "select token from invitations where email = $1 order by created_at desc limit 1",
      ["guest@e2e.test"],
    );
    expect(invite?.token).toBeTruthy();

    const guestContext = await browser.newContext();
    const guest = await guestContext.newPage();
    await guest.goto(`/invite/${invite?.token}`);
    await guest.fill("#name", "客座编辑");
    await guest.fill("#username", "e2eguest");
    await guest.fill("#password", "guest-password-1234");
    await guest.getByRole("button", { name: "接受邀请" }).click();
    await guest.waitForURL(/\/admin$/);

    // Editor-scoped: no admin-only nav, /admin/users bounces, CRUD works.
    await expect(guest.locator('a[href="/admin/users"]')).toHaveCount(0);
    await guest.goto("/admin/users");
    await guest.waitForURL(/\/admin$/);
    await guest.goto("/admin/films");
    await expect(guest.locator("h1")).toHaveText("影片");
    await guestContext.close();
  });
});
