import { expect, test } from "@playwright/test";

/**
 * Search is a static per-locale index (/[lang]/search-index.json)
 * matched client-side by the header dialog and the /search page. These
 * assert the index's draft/en-subset gating (the part a unit test
 * can't see end-to-end) and the two UI surfaces.
 *
 * Fixtures (setup/reset-db.ts): otto-e-mezzo carries the full variant
 * set (八部半 / 八又二分之一 / Otto e mezzo / 8½) and is zh+en;
 * la-strada and anouk-aimee are zh-only (the en-subset negatives);
 * il-bidone and draft-list are drafts; tag modernism → otto-e-mezzo,
 * neorealism → la-strada only. Never depend on editorial.spec's
 * runtime-created publish-flow-film.
 */

test("the zh index carries films, people, lists, and tags — but no drafts", async ({ request }) => {
  const res = await request.get("/zh/search-index.json");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("application/json");
  const body = await res.text();
  expect(body).toContain('"/zh/film/otto-e-mezzo"');
  expect(body).toContain('"/zh/director/federico-fellini"');
  expect(body).toContain('"/zh/list/fellini-primer"');
  expect(body).toContain('"/zh/films?tag=modernism"');
  expect(body).not.toContain("il-bidone");
  expect(body).not.toContain("draft-list");
});

test("the en index is the en-published subset with English prose only", async ({ request }) => {
  const body = await (await request.get("/en/search-index.json")).text();
  expect(body).toContain('"/en/film/otto-e-mezzo"');
  // zh-only entities stay out — including the tag whose only film is
  // zh-only. Assert hrefs/labels, not bare words: Fellini's English bio
  // legitimately contains the word "neorealism".
  expect(body).not.toContain("la-strada");
  expect(body).not.toContain("anouk-aimee");
  expect(body).not.toContain("films?tag=neorealism");
  expect(body).not.toContain("新现实主义");
  // No zh prose (the fixture note's distinctive opening)…
  expect(body).not.toContain("费里尼在这部影片里");
  // …while zh titles/names stay matchable (titles are names).
  expect(body).toContain("八部半");
});

test("header dialog finds 费里尼 and navigates", async ({ page }) => {
  await page.goto("/zh");
  await page.getByRole("banner").getByRole("button", { name: "搜索" }).click();
  await page.getByRole("searchbox", { name: "搜索" }).fill("费里尼");
  // Scope to the dialog — the home page behind it links films too.
  const dialog = page.getByRole("dialog");
  const director = dialog.locator('a[href="/zh/director/federico-fellini"]');
  await expect(director).toBeVisible();
  // Films surface through the director-name variant too.
  await expect(dialog.locator('a[href="/zh/film/otto-e-mezzo"]')).toBeVisible();
  await director.click();
  await expect(page).toHaveURL("/zh/director/federico-fellini");
  await expect(page.getByRole("searchbox", { name: "搜索" })).toHaveCount(0);
});

test("every title variant finds the same film", async ({ page }) => {
  await page.goto("/zh/search");
  const input = page.getByRole("searchbox", { name: "搜索" });
  for (const q of ["八又二分之一", "Otto e mezzo", "8½"]) {
    await input.fill(q);
    await expect(page.locator('a[href="/zh/film/otto-e-mezzo"]')).toBeVisible();
  }
});

test("?q is a shareable cold URL; results are island-only, invisible to crawlers", async ({
  page,
  request,
}) => {
  await page.goto("/zh/search?q=fellini");
  await expect(page.locator('a[href="/zh/director/federico-fellini"]')).toBeVisible();

  // No-JS fetch: the prerendered HTML has the input but no results.
  const html = await (await request.get("/zh/search?q=fellini")).text();
  expect(html).toContain("片名、导演、片单");
  expect(html).not.toContain('href="/zh/director/federico-fellini"');
});

test("/en search respects the subset", async ({ page }) => {
  await page.goto("/en/search?q=strada");
  await expect(page.getByText("Nothing found.")).toBeVisible();
  await expect(page.locator('a[href="/en/film/la-strada"]')).toHaveCount(0);

  // A zh-only person's cast credit still surfaces the en-visible FILM
  // (her name renders on its /en cast list), but never her person page.
  const input = page.getByRole("searchbox", { name: "Search" });
  await input.fill("anouk");
  await expect(page.locator('a[href="/en/film/otto-e-mezzo"]')).toBeVisible();
  await expect(page.locator('a[href*="anouk-aimee"]')).toHaveCount(0);

  await input.fill("fellini");
  await expect(page.locator('a[href="/en/director/federico-fellini"]')).toBeVisible();
});

test("Enter in the dialog jumps to the top result", async ({ page }) => {
  await page.goto("/zh");
  await page.getByRole("banner").getByRole("button", { name: "搜索" }).click();
  const input = page.getByRole("searchbox", { name: "搜索" });
  await input.fill("卡比利亚");
  // Wait for the match so Enter targets the result, not the fallback
  // link — scoped to the dialog, the home page links films too.
  await expect(
    page.getByRole("dialog").locator('a[href="/zh/film/le-notti-di-cabiria"]'),
  ).toBeVisible();
  await input.press("Enter");
  await expect(page).toHaveURL("/zh/film/le-notti-di-cabiria");
});
