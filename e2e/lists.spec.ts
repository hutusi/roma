import { expect, test } from "@playwright/test";
import { queryOne } from "./utils/db";

test.use({ storageState: "e2e/.auth/admin.json" });

async function primerId(): Promise<string> {
  const row = await queryOne<{ id: string }>("select id from curated_lists where slug = $1", [
    "fellini-primer",
  ]);
  if (!row) throw new Error("fixture list missing");
  return row.id;
}

test("added film appears without a hard reload", async ({ page }) => {
  await page.goto(`/admin/lists/${await primerId()}`);
  const handles = page.getByTitle("拖动排序");
  const before = await handles.count();

  await page.locator("select").first().selectOption({ label: "卡比利亚之夜（1957）" });
  await page.getByRole("button", { name: "加入" }).click();

  // Regression: the panel must adopt refreshed server data in place.
  await expect(handles).toHaveCount(before + 1, { timeout: 15_000 });
});

test("keyboard drag-reorder persists across reload", async ({ page }) => {
  await page.goto(`/admin/lists/${await primerId()}`);
  const firstRowBefore = await page.getByTitle("拖动排序").first().locator("..").textContent();

  const secondHandle = page.getByTitle("拖动排序").nth(1);
  await secondHandle.focus();
  await page.keyboard.press("Space");
  await page.waitForTimeout(300);
  await page.keyboard.press("ArrowUp");
  await page.waitForTimeout(300);
  await page.keyboard.press("Space");
  await page.waitForTimeout(1500);

  await page.reload();
  const firstRowAfter = await page.getByTitle("拖动排序").first().locator("..").textContent();
  expect(firstRowAfter).not.toBe(firstRowBefore);
});

test("per-film reasoning saves from the expanded row", async ({ page }) => {
  await page.goto(`/admin/lists/${await primerId()}`);
  await page.getByText("缺入选理由").first().click();
  // The expanded row holds a zh and an en editor — pick the zh one by
  // its (still-empty) placeholder.
  await page
    .locator('[contenteditable="true"]', {
      has: page.locator('[data-placeholder*="这部影片为什么在这份片单里"]'),
    })
    .click();
  await page.keyboard.type("入选理由：从这里能看到转折。");
  await page.getByRole("button", { name: "保存理由", exact: true }).click();
  await expect(page.locator("[data-sonner-toast]", { hasText: "入选理由已保存" })).toBeVisible();
});

test("public list hides draft films; preview shows them", async ({ page }) => {
  await page.goto("/zh/list/fellini-primer");
  await expect(page.getByText("费里尼尚未离开新现实主义")).toBeVisible();
  await expect(page.locator("ol li", { hasText: "大路" })).toBeVisible();
  // Draft film (骗子) sits in the list rows but must not render publicly.
  await expect(page.locator("ol li", { hasText: "骗子" })).toHaveCount(0);

  await page.goto(`/admin/preview/list/${await primerId()}`);
  await expect(page.getByText("草稿预览")).toBeVisible();
  await expect(page.locator("ol li", { hasText: "骗子" })).toBeVisible();
});

test("draft list 404s publicly", async ({ page }) => {
  const res = await page.request.get("/zh/list/draft-list");
  expect(res.status()).toBe(404);
});
