import { expect, test } from "@playwright/test";

/**
 * /films is prerendered, so ?decade/?country are applied by a client
 * island rather than the server. These assert the filter still works from
 * a cold URL (not just via the form), and that the unfiltered catalogue
 * survives in the static HTML — the island reads the query only after
 * hydration, so anything it renders is invisible to crawlers.
 *
 * Fixtures: la-strada (1954, 意大利, B&W), otto-e-mezzo (1963,
 * 意大利+法国, B&W) and giulietta-degli-spiriti (1965, color). All are
 * seeded and never mutated; publish-flow-film is created by
 * editorial.spec at runtime, so nothing here depends on it.
 */

const card = (page: import("@playwright/test").Page, slug: string) =>
  page.locator(`a[href="/zh/film/${slug}"]`);

test("unfiltered /films lists the catalogue", async ({ page }) => {
  await page.goto("/zh/films");
  await expect(card(page, "otto-e-mezzo")).toBeVisible();
  await expect(card(page, "la-strada")).toBeVisible();
});

test("?decade filters from a cold URL", async ({ page }) => {
  await page.goto("/zh/films?decade=1960");
  // 8½ (1963) stays; La Strada (1954) goes.
  await expect(card(page, "otto-e-mezzo")).toBeVisible();
  await expect(card(page, "la-strada")).toHaveCount(0);
});

test("?country filters, and the param speaks the display language", async ({ page }) => {
  await page.goto(`/zh/films?country=${encodeURIComponent("法国")}`);
  await expect(card(page, "otto-e-mezzo")).toBeVisible();
  await expect(card(page, "la-strada")).toHaveCount(0);
});

test("?palette filters from a cold URL, both ways", async ({ page }) => {
  await page.goto("/zh/films?palette=color");
  await expect(card(page, "giulietta-degli-spiriti")).toBeVisible();
  await expect(card(page, "otto-e-mezzo")).toHaveCount(0);

  await page.goto("/zh/films?palette=bw");
  await expect(card(page, "otto-e-mezzo")).toBeVisible();
  await expect(card(page, "giulietta-degli-spiriti")).toHaveCount(0);
});

test("?tag filters by slug from a cold URL", async ({ page }) => {
  await page.goto("/zh/films?tag=modernism");
  await expect(card(page, "otto-e-mezzo")).toBeVisible();
  await expect(card(page, "la-strada")).toHaveCount(0);
});

test("choosing a filter applies it at once and puts it in the URL", async ({ page }) => {
  await page.goto("/zh/films");
  // Counts, not exact numbers: editorial.spec publishes a film at runtime.
  await expect(page.getByText(/^共 \d+ 部影片$/)).toBeVisible();
  await page.getByRole("combobox", { name: "年代" }).selectOption("1960");
  await expect(page).toHaveURL(/\/zh\/films\?decade=1960$/);
  await expect(card(page, "la-strada")).toHaveCount(0);
  await expect(page.getByText(/^筛选出 \d+ 部，共 \d+ 部/)).toBeVisible();

  // Clearing restores the catalogue and the bare URL.
  await page.getByRole("button", { name: "清除筛选" }).click();
  await expect(page).toHaveURL(/\/zh\/films$/);
  await expect(card(page, "la-strada")).toBeVisible();
});

test("a filter with no matches says so and offers a way back", async ({ page }) => {
  await page.goto("/zh/films?decade=1960&palette=color&tag=modernism");
  await expect(page.getByText("没有符合条件的影片。")).toBeVisible();
  await page.getByRole("button", { name: "清除筛选" }).last().click();
  await expect(card(page, "otto-e-mezzo")).toBeVisible();
});

test("the decade options cover the catalogue, not a fixed range", async ({ page }) => {
  await page.goto("/zh/films");
  const options = await page
    .getByRole("combobox", { name: "年代" })
    .locator("option")
    .allTextContents();
  // Derived from the films the edition shows: the zh fixtures' 1950s and
  // 1960s, and none of the old hard-coded 1920s–1980s range they don't reach.
  expect(options).toEqual(expect.arrayContaining(["全部年代", "1950 年代", "1960 年代"]));
  expect(options).not.toContain("1920 年代");
});

test("the prerendered HTML carries every film, so crawlers see them unfiltered", async ({
  request,
}) => {
  // Deliberately not page.goto: no JS runs, which is what a crawler and a
  // no-JS reader get. A filtered URL must still serve the full catalogue
  // rather than an empty shell.
  const html = await (await request.get("/zh/films?decade=1960")).text();
  expect(html).toContain('href="/zh/film/otto-e-mezzo"');
  expect(html).toContain('href="/zh/film/la-strada"');
});
