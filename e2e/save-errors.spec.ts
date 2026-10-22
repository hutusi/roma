import { expect, type Page, test } from "@playwright/test";
import { queryOne } from "./utils/db";

/**
 * Saves that hit the database's own rules, and saves of formatted prose.
 * Both used to fail with a generic, masked error: Drizzle wraps the
 * Postgres error (so a taken slug was never recognised), and essay attrs
 * reached the server action as null-prototype objects it couldn't take.
 */

test.use({ storageState: "e2e/.auth/admin.json" });

const toast = (page: Page, text: string) => page.locator("[data-sonner-toast]", { hasText: text });

async function fillNewFilm(page: Page, slug: string) {
  await page.goto("/admin/films/new");
  await page.fill("#titleZh", "保存错误测试");
  await page.fill("#titleOriginal", "Save Errors");
  await page.fill("#slug", slug);
  await page.fill("#year", "1961");
  await page.getByLabel("费德里科·费里尼").check();
}

test("a taken film slug is named, not a generic failure", async ({ page }) => {
  await fillNewFilm(page, "otto-e-mezzo");
  await page.click("button[type=submit]");
  await expect(toast(page, "slug「otto-e-mezzo」已被使用")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/films\/new$/);
});

test("a taken list slug is named, not a generic failure", async ({ page }) => {
  await page.goto("/admin/lists/new");
  await page.fill("#title", "重复的片单");
  await page.fill("#slug", "fellini-primer");
  await page.click("button[type=submit]");
  await expect(toast(page, "slug「fellini-primer」已被使用")).toBeVisible();
});

test("an essay with a heading saves", async ({ page }) => {
  await fillNewFilm(page, "essay-heading-save");
  await page.locator(".ProseMirror").first().click();
  await page.locator('button[title="二级标题"]').first().click();
  await page.keyboard.type("为什么要写这篇");
  await page.click("button[type=submit]");
  await page.waitForURL(/\/admin\/films\/(?!new)[^/]+$/);
  await expect(page.locator(".ProseMirror h2").first()).toHaveText("为什么要写这篇");

  await queryOne("delete from films where slug = 'essay-heading-save' returning id");
});
