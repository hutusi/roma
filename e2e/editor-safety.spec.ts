import { randomUUID } from "node:crypto";
import { expect, type Page, test } from "@playwright/test";
import { queryOne } from "./utils/db";

/**
 * Editors must not lose work: to a second editor saving the same film, to
 * a failed request, or to a stray click while a form is dirty.
 */

test.use({ storageState: "e2e/.auth/admin.json" });

async function draftFilm() {
  const id = randomUUID();
  const director = await queryOne<{ id: string }>(
    "select id from people where slug = 'federico-fellini'",
  );
  if (!director) throw new Error("director fixture missing");
  await queryOne(
    "insert into films (id, slug, title_zh, title_original, year, countries, is_black_and_white, status, status_en, created_at, updated_at) values ($1, $2, '编辑安全', 'Editor Safety', 1966, '{}', true, 'draft', 'draft', now(), now()) returning id",
    [id, `editor-safety-${id}`],
  );
  await queryOne(
    "insert into film_directors (film_id, director_id, position) values ($1, $2, 0) returning film_id",
    [id, director.id],
  );
  return id;
}

const toast = (page: Page, text: string | RegExp) =>
  page.locator("[data-sonner-toast]", { hasText: text });

test("a stale save is refused, not applied over a colleague's", async ({ browser }) => {
  const id = await draftFilm();
  const first = await (
    await browser.newContext({ storageState: "e2e/.auth/admin.json" })
  ).newPage();
  const second = await (
    await browser.newContext({ storageState: "e2e/.auth/admin.json" })
  ).newPage();
  await Promise.all([first.goto(`/admin/films/${id}`), second.goto(`/admin/films/${id}`)]);

  await first.fill("#titleOriginal", "Saved First");
  await first.getByRole("button", { name: /^保存/ }).click();
  await expect(toast(first, "已保存")).toBeVisible();

  // The second editor still has the old revision open.
  await second.fill("#titleOriginal", "Saved Second");
  await second.getByRole("button", { name: /^保存/ }).click();
  await expect(toast(second, "已被其他编辑保存过")).toBeVisible();
  // Their edit is still on the page, and the first save stands.
  await expect(second.locator("#titleOriginal")).toHaveValue("Saved Second");
  const row = await queryOne<{ title_original: string; revision: number }>(
    "select title_original, revision from films where id = $1",
    [id],
  );
  expect(row).toEqual({ title_original: "Saved First", revision: 1 });

  await first.context().close();
  await second.context().close();
  await queryOne("delete from films where id = $1 returning id", [id]);
});

test("a failed request keeps the form and frees the button", async ({ page }) => {
  const id = await draftFilm();
  await page.goto(`/admin/films/${id}`);
  await page.fill("#titleOriginal", "Unsaved Edit");

  // Server actions POST to the page URL; drop exactly those.
  await page.route(`**/admin/films/${id}`, (route) =>
    route.request().method() === "POST" ? route.abort("failed") : route.continue(),
  );
  await page.getByRole("button", { name: /^保存/ }).click();
  await expect(toast(page, "操作没有完成")).toBeVisible();
  await expect(page.locator("#titleOriginal")).toHaveValue("Unsaved Edit");
  await expect(page.getByRole("button", { name: /^保存/ })).toBeEnabled();

  await page.unroute(`**/admin/films/${id}`);
  await queryOne("delete from films where id = $1 returning id", [id]);
});

test("leaving a dirty form asks first", async ({ page }) => {
  const id = await draftFilm();
  await page.goto(`/admin/films/${id}`);
  await page.fill("#titleOriginal", "Half-Typed");

  await page.getByRole("link", { name: "影片", exact: true }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toContainText("有未保存的修改");
  await dialog.getByRole("button", { name: "继续编辑" }).click();
  await expect(page).toHaveURL(new RegExp(`/admin/films/${id}$`));
  await expect(page.locator("#titleOriginal")).toHaveValue("Half-Typed");

  // Saved, the same link just navigates.
  await page.getByRole("button", { name: /^保存/ }).click();
  await expect(toast(page, "已保存")).toBeVisible();
  await page.getByRole("link", { name: "影片", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/films$/);

  await queryOne("delete from films where id = $1 returning id", [id]);
});
