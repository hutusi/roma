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
