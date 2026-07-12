import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("sitemap lists published slugs only, on the canonical origin", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("https://babuban.com/zh/film/otto-e-mezzo");
  expect(sitemap).toContain("https://babuban.com/zh/list/fellini-primer");
  expect(sitemap).not.toContain("il-bidone"); // draft
  expect(sitemap).not.toContain("draft-list");
});

test("robots blocks private paths and links the sitemap", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("/admin");
  expect(robots).toContain("sitemap.xml");
});

test("OG images render as PNG for home and films", async ({ page, request }) => {
  const root = await request.get("/zh/opengraph-image");
  expect(root.status()).toBe(200);
  expect(root.headers()["content-type"]).toContain("image/png");

  // Dynamic routes mount OG images at hashed paths — read the page's meta.
  await page.goto("/zh/film/otto-e-mezzo");
  const ogUrl = await page.locator('meta[property="og:image"]').first().getAttribute("content");
  expect(ogUrl).toBeTruthy();
  const local = (ogUrl as string).replace("https://babuban.com", "");
  const image = await request.get(local);
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toContain("image/png");
  expect((await image.body()).byteLength).toBeGreaterThan(10_000);
});

test("unknown film gets the styled 404", async ({ page }) => {
  const response = await page.goto("/zh/film/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("此片散佚")).toBeVisible();
});

test("password reset loop completes against the production build", async ({ page }) => {
  await page.goto("/zh/forgot-password");
  await page.fill("#email", "user@e2e.test");
  await page.getByRole("button", { name: "发送重置邮件" }).click();
  await expect(page.getByText("邮件已发送")).toBeVisible();

  // The e2e server writes reset URLs to a log file (E2E_ALLOW_LOG_RESET).
  await expect(async () => {
    const log = await readFile("e2e/.auth/reset-urls.log", "utf8");
    expect(log).toContain("user@e2e.test");
  }).toPass({ timeout: 10_000 });
  const log = await readFile("e2e/.auth/reset-urls.log", "utf8");
  const resetUrl = log.trim().split("\n").at(-1)?.split(" ")[1];
  expect(resetUrl).toBeTruthy();

  await page.goto(resetUrl as string);
  await page.fill("#password", "e2e-user-password"); // same value keeps later specs valid
  await page.getByRole("button", { name: "重置密码" }).click();
  await page.waitForURL(/\/sign-in/);

  await page.fill("#email", "user@e2e.test");
  await page.fill("#password", "e2e-user-password");
  await page.click("button[type=submit]");
  await page.waitForURL(/\/zh$/);
});

test("canonical and og/twitter identity are per-locale", async ({ page }) => {
  await page.goto("/zh/film/otto-e-mezzo");
  await expect(
    page.locator('link[rel="canonical"][href="https://babuban.com/zh/film/otto-e-mezzo"]'),
  ).toHaveCount(1);
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "八部半");
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "zh_CN");
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "video.movie");
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  // twitter:image must autofill from the file-convention og image.
  await expect(page.locator('meta[name="twitter:image"]')).toHaveCount(1);

  await page.goto("/en/film/otto-e-mezzo");
  await expect(
    page.locator('link[rel="canonical"][href="https://babuban.com/en/film/otto-e-mezzo"]'),
  ).toHaveCount(1);
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Babuban");
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "en_US");
});

test("films filter permutations canonicalize back to the bare listing", async ({ page }) => {
  await page.goto("/zh/films?decade=1960&country=%E6%84%8F%E5%A4%A7%E5%88%A9");
  await expect(
    page.locator('link[rel="canonical"][href="https://babuban.com/zh/films"]'),
  ).toHaveCount(1);
});

test("sitemap entries carry lastmod", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("<lastmod>");
});

test("auth entry pages are noindex", async ({ page }) => {
  for (const path of ["/zh/sign-in", "/zh/sign-up"]) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  }
});

test("home emits WebSite + Organization JSON-LD", async ({ page }) => {
  await page.goto("/zh");
  const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
  const graph = JSON.parse(jsonLd as string)["@graph"] as Record<string, unknown>[];
  expect(graph.map((n) => n["@type"])).toEqual(["WebSite", "Organization"]);
});

test("brand icons and manifest are served; codename stays internal", async ({ request }) => {
  for (const path of [
    "/favicon.ico",
    "/icon.svg",
    "/apple-icon.png",
    "/icons/icon-512.png",
    "/manifest.webmanifest",
  ]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
  const manifest = await (await request.get("/manifest.webmanifest")).text();
  expect(manifest).toContain("八部半");
  expect(manifest.toLowerCase()).not.toContain("roma");
  // No INDEXNOW_KEY in the e2e env → the key file must 404, not leak an empty 200.
  expect((await request.get("/indexnow-key.txt")).status()).toBe(404);
});
