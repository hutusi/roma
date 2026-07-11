import { expect, test } from "@playwright/test";

// Fixtures (see setup/reset-db.ts): otto-e-mezzo, federico-fellini, and
// fellini-primer carry published English editions; la-strada is
// zh-published only, so it exercises the subset rule.

test("en film page renders the English edition with lang=en", async ({ page }) => {
  const response = await page.goto("/en/film/otto-e-mezzo");
  expect(response?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: "8½" })).toBeVisible();
  await expect(page.getByText("word1 word2 word3")).toBeVisible();
  // No zh prose leaks onto the en page.
  await expect(page.getByText("编辑札记")).toHaveCount(0);
});

test("image-credit caption is localized (no zh 图片来源 on /en)", async ({ page }) => {
  // zh keeps the Chinese caption…
  await page.goto("/film/otto-e-mezzo");
  await expect(page.getByText("图片来源")).toBeVisible();

  // …and /en shows the English one, never the zh label.
  await page.goto("/en/film/otto-e-mezzo");
  await expect(page.getByText("图片来源")).toHaveCount(0);
  await expect(page.getByText("Source: TMDB")).toBeVisible();

  // The director page shares AcademyFrame — verify the fix there too.
  await page.goto("/en/director/federico-fellini");
  await expect(page.getByText("图片来源")).toHaveCount(0);
});

test("subset rule: zh-only film 404s on /en but stays live on zh", async ({ page }) => {
  const en = await page.goto("/en/film/la-strada");
  expect(en?.status()).toBe(404);
  await expect(page.getByText("Lost to time")).toBeVisible();

  const zh = await page.goto("/film/la-strada");
  expect(zh?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "大路" })).toBeVisible();
});

test("en home and indexes show only the en-published subset", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByText("8½").first()).toBeVisible();
  await expect(page.getByText("大路")).toHaveCount(0);

  await page.goto("/en/films");
  await expect(page.locator('a[href="/en/film/otto-e-mezzo"]')).toHaveCount(1);
  await expect(page.locator('a[href="/en/film/la-strada"]')).toHaveCount(0);
});

test("en list keeps order and degrades untranslated members to unlinked entries", async ({
  page,
}) => {
  await page.goto("/en/list/fellini-primer");
  await expect(page.getByRole("heading", { name: "A Fellini Primer" })).toBeVisible();
  // The zh-only member renders (order preserved) but never links.
  await expect(page.getByText("La strada")).toBeVisible();
  await expect(page.locator('a[href="/en/film/la-strada"]')).toHaveCount(0);
  await expect(page.locator('a[href="/en/film/otto-e-mezzo"]')).toHaveCount(1);
});

test("en director page shows English bio and only en-published films", async ({ page }) => {
  await page.goto("/en/director/federico-fellini");
  await expect(page.getByText("Italian director, 1920–1993")).toBeVisible();
  await expect(page.locator('a[href="/en/film/otto-e-mezzo"]').first()).toBeVisible();
  await expect(page.locator('a[href="/en/film/la-strada"]')).toHaveCount(0);
});

test("hreflang pairs both locales and skips zh-only entities", async ({ page }) => {
  await page.goto("/film/otto-e-mezzo");
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"][href$="/en/film/otto-e-mezzo"]'),
  ).toHaveCount(1);

  await page.goto("/film/la-strada");
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(0);

  await page.goto("/en/film/otto-e-mezzo");
  await expect(
    page.locator('link[rel="alternate"][hreflang="zh-CN"][href$="/film/otto-e-mezzo"]'),
  ).toHaveCount(1);
});

test("sitemap carries en entries only for en-published entities", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("https://babuban.com/en/film/otto-e-mezzo");
  expect(sitemap).toContain("https://babuban.com/en/list/fellini-primer");
  expect(sitemap).not.toContain("/en/film/la-strada");
  expect(sitemap).toContain('hreflang="en"');
});

test("locale switch links pair pages in both directions", async ({ page }) => {
  await page.goto("/film/otto-e-mezzo");
  await expect(
    page.locator('a[href="/en/film/otto-e-mezzo"]', { hasText: "English" }),
  ).toBeVisible();

  await page.goto("/en/film/otto-e-mezzo");
  await expect(page.locator('a[href="/film/otto-e-mezzo"]', { hasText: "中文版" })).toBeVisible();

  // zh-only film offers no switch into the void (the footer's
  // site-level switch to /en is always there; the page-level one isn't).
  await page.goto("/film/la-strada");
  await expect(page.locator('a[href="/en/film/la-strada"]')).toHaveCount(0);
});

test("en OG image renders as PNG", async ({ page, request }) => {
  await page.goto("/en/film/otto-e-mezzo");
  const ogUrl = await page.locator('meta[property="og:image"]').first().getAttribute("content");
  expect(ogUrl).toBeTruthy();
  const local = (ogUrl as string).replace("https://babuban.com", "");
  const image = await request.get(local);
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toContain("image/png");
});

test("en auth pages render in English", async ({ page }) => {
  await page.goto("/en/sign-in");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("en about page renders in English", async ({ page }) => {
  const response = await page.goto("/en/about");
  expect(response?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: "About Babuban" })).toBeVisible();
});

test("unknown /en path 404s with the styled en page", async ({ page }) => {
  const response = await page.goto("/en/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("Lost to time")).toBeVisible();
});

test("x-default hreflang points at the zh root", async ({ page }) => {
  await page.goto("/film/otto-e-mezzo");
  await expect(
    page.locator('link[rel="alternate"][hreflang="x-default"][href$="/film/otto-e-mezzo"]'),
  ).toHaveCount(1);
});

test("en pages carry an English OG alt, not the zh root one", async ({ page }) => {
  await page.goto("/en");
  const alt = await page.locator('meta[property="og:image:alt"]').first().getAttribute("content");
  expect(alt).toBeTruthy();
  expect(alt).not.toContain("经典电影策展"); // the zh root alt
  expect(alt).toContain("Babuban");
});
