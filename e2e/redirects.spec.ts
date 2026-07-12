import { expect, test } from "@playwright/test";

// The launch-era root URLs 308 to /zh (ADR 0012). maxRedirects: 0 so we
// assert the hop itself, not the destination.
const hop = { maxRedirects: 0 } as const;

test("root and legacy zh URLs redirect permanently to /zh", async ({ request }) => {
  for (const [source, destination] of [
    ["/", "/zh"],
    ["/film/otto-e-mezzo", "/zh/film/otto-e-mezzo"],
    ["/list/fellini-primer", "/zh/list/fellini-primer"],
    ["/about", "/zh/about"],
    ["/rss.xml", "/zh/rss.xml"],
  ]) {
    const response = await request.get(source, hop);
    expect(response.status(), source).toBe(308);
    expect(response.headers().location, source).toBe(destination);
  }
});

test("redirects preserve query strings", async ({ request }) => {
  const response = await request.get("/films?decade=1960", hop);
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/zh/films?decade=1960");
});

test("redirected user areas land on the locale sign-in when logged out", async ({ page }) => {
  await page.goto("/me/follows");
  await expect(page).toHaveURL(/\/zh\/sign-in\?next=/);
});

test("locale-prefixed and non-page URLs are not redirected", async ({ request }) => {
  for (const path of ["/en/film/otto-e-mezzo", "/en", "/robots.txt", "/sitemap.xml"]) {
    const response = await request.get(path, hop);
    expect(response.status(), path).toBe(200);
  }
});

test("the redirect target serves the zh feed", async ({ request }) => {
  const response = await request.get("/zh/rss.xml");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/xml");
  expect(await response.text()).toContain("<language>zh-CN</language>");
});
