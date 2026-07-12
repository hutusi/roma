import { expect, test } from "@playwright/test";
import { queryOne } from "./utils/db";

const NOTE_200 = "字".repeat(220);

test.use({ storageState: "e2e/.auth/admin.json" });

test("publish gate: short 札记 blocked with count, then publish goes live without redeploy", async ({
  page,
}) => {
  await page.goto("/admin/films/new");
  await page.fill("#titleZh", "发布流程测试");
  await page.fill("#titleOriginal", "Publish Flow");
  await page.fill("#slug", "publish-flow-film");
  await page.fill("#year", "1960");
  await page.getByLabel("费德里科·费里尼").check();
  await page.locator('textarea[name="editorialNote"]').fill("太短。");
  await page.click("button[type=submit]");
  await page.waitForURL(/\/admin\/films\/(?!new)[^/]+$/);

  await page.getByRole("button", { name: "发布", exact: true }).click();
  await expect(page.locator("[data-sonner-toast]", { hasText: "编辑札记需 200" })).toBeVisible();

  await page.locator('textarea[name="editorialNote"]').fill(NOTE_200);
  await page.getByRole("button", { name: /^保存/ }).click();
  await expect(page.locator("[data-sonner-toast]", { hasText: "已保存" })).toBeVisible();
  await page.getByRole("button", { name: "发布", exact: true }).click();
  await expect(page.locator("[data-sonner-toast]", { hasText: "已发布" })).toBeVisible();

  // The slug wasn't in the prerender manifest — this proves on-demand
  // rendering + revalidation, i.e. publish-without-redeploy.
  const response = await page.goto("/zh/film/publish-flow-film");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "发布流程测试" })).toBeVisible();
});

test("draft film: 404 publicly, full render in editor preview", async ({ page }) => {
  const draftRes = await page.request.get("/zh/film/il-bidone");
  expect(draftRes.status()).toBe(404);

  const draft = await queryOne<{ id: string }>("select id from films where slug = $1", [
    "il-bidone",
  ]);
  await page.goto(`/admin/preview/film/${draft?.id}`);
  await expect(page.getByText("草稿预览")).toBeVisible();
  await expect(page.getByRole("heading", { name: "草稿小节" })).toBeVisible();
  await expect(page.locator("blockquote")).toContainText("这段只有编辑能看见");
});

test("essay renders through the shared extension contract on the public page", async ({ page }) => {
  await page.goto("/zh/film/otto-e-mezzo");
  await expect(page.getByRole("heading", { name: "为什么是黑白版" })).toBeVisible();
  await expect(page.locator("blockquote")).toContainText("告别本来就不该匆忙");
  // 译名 block carries all region variants
  await expect(page.getByText("八又二分之一")).toBeVisible();
});

test("publish gate: empty list blocked", async ({ page }) => {
  await page.goto("/admin/lists/new");
  await page.fill("#title", "空片单");
  await page.fill("#slug", "empty-list-gate");
  await page.click("button[type=submit]");
  await page.waitForURL(/\/admin\/lists\/(?!new)[^/]+$/);
  await page.getByRole("button", { name: "发布", exact: true }).click();
  await expect(
    page.locator("[data-sonner-toast]", { hasText: "至少要包含一部影片" }),
  ).toBeVisible();
});
