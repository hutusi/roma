import { expect, type Page, test } from "@playwright/test";

/**
 * Phone layout, run by the `mobile` project at 375px. The live site once
 * wrapped the header's CJK labels a character per line and scrolled
 * /films sideways; these pin that it doesn't.
 */

async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(
    scrollWidth,
    `page is ${scrollWidth}px wide in a ${innerWidth}px viewport`,
  ).toBeLessThanOrEqual(innerWidth);
}

const ROUTES = [
  "",
  "/films",
  "/lists",
  "/film/otto-e-mezzo",
  "/list/fellini-primer",
  "/director/federico-fellini",
  "/search?q=fellini",
  "/about",
  "/sign-in",
];

for (const locale of ["zh", "en"] as const) {
  for (const route of ROUTES) {
    test(`/${locale}${route} fits a 375px screen`, async ({ page }) => {
      await page.goto(`/${locale}${route}`);
      await expect(page.getByRole("banner")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }
}

test.describe("signed in", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("account and follows fit a 375px screen", async ({ page }) => {
    for (const path of ["/zh/account", "/zh/me/follows", "/en/account"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });
});

test("the header stays one row, with the sections behind a menu", async ({ page }) => {
  await page.goto("/zh");
  const header = page.getByRole("banner");
  const box = await header.boundingBox();
  expect(box?.height ?? 0).toBeLessThan(80);

  // The inline sections are hidden; the menu button carries them.
  await expect(header.getByRole("navigation", { name: "主导航" })).toBeHidden();
  const menu = header.getByRole("button", { name: "菜单" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  const panel = page.locator("#mobile-menu");
  await expect(panel.getByRole("link", { name: "影片" })).toBeVisible();
  await expect(panel.getByRole("link", { name: "登录" })).toBeVisible();

  // Escape closes it and hands focus back to the button.
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(header.getByRole("button", { name: "菜单" })).toBeFocused();

  // Following a link closes it too, and marks the section as current.
  await header.getByRole("button", { name: "菜单" }).click();
  await panel.getByRole("link", { name: "影片" }).click();
  await expect(page).toHaveURL(/\/zh\/films$/);
  await expect(panel).toBeHidden();
  await header.getByRole("button", { name: "菜单" }).click();
  await expect(panel.getByRole("link", { name: "影片" })).toHaveAttribute("aria-current", "page");
});
