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
    await expect(page).toHaveURL(/\/zh$/);
  });
});

test.describe("admin", () => {
  test.use({ storageState: "e2e/.auth/admin.json" });

  test("reaches the dashboard with counts", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("h1")).toHaveText("仪表盘");
    await expect(page.getByText("草稿").first()).toBeVisible();
  });

  test("invite flow: guest becomes editor with editor-scoped access", async ({ page, browser }) => {
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
    await guest.goto(`/zh/invite/${invite?.token}`);
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

  // Better Auth lowercases the address at signup, so an invitation stored
  // with the admin's original casing used to promote zero rows while still
  // marking itself accepted: the invite was burned and the account stayed
  // a plain user. The test above never caught it — its email is lowercase.
  test("invite flow: a mixed-case email still promotes the account", async ({ page, browser }) => {
    await page.goto("/admin/invites");
    await page.fill('input[type="email"]', "  Mixed.Case@E2E.Test  ");
    await page.getByRole("button", { name: "创建邀请" }).click();
    await expect(page.locator("[data-sonner-toast]").last()).toBeVisible();

    const invite = await queryOne<{ token: string; email: string; invited_by: string | null }>(
      "select token, email, invited_by from invitations where email = $1 order by created_at desc limit 1",
      ["mixed.case@e2e.test"],
    );
    expect(invite?.email).toBe("mixed.case@e2e.test");
    // The column exists with a live FK but was never written.
    expect(invite?.invited_by).toBeTruthy();

    const guestContext = await browser.newContext();
    const guest = await guestContext.newPage();
    await guest.goto(`/zh/invite/${invite?.token}`);
    await guest.fill("#name", "大小写编辑");
    await guest.fill("#username", "e2emixedcase");
    await guest.fill("#password", "guest-password-1234");
    await guest.getByRole("button", { name: "接受邀请" }).click();
    await guest.waitForURL(/\/admin$/);

    const promoted = await queryOne<{ role: string }>("select role from users where email = $1", [
      "mixed.case@e2e.test",
    ]);
    expect(promoted?.role).toBe("editor");
    await guestContext.close();
  });
});
