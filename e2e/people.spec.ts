import { expect, test } from "@playwright/test";
import { queryOne } from "./utils/db";

// maxRedirects: 0 so we assert the 308 hop itself, not the destination.
const hop = { maxRedirects: 0 } as const;

const NOTE_200 = "字".repeat(220);

test("actor page renders bio and acted-in filmography with characters", async ({ page }) => {
  await page.goto("/zh/actor/giulietta-masina");
  await expect(page.getByRole("heading", { name: "茱莉艾塔·玛西娜" })).toBeVisible();
  await expect(page.getByText("出演作品")).toBeVisible();
  await expect(page.getByRole("link", { name: /大路/ })).toHaveAttribute(
    "href",
    "/zh/film/la-strada",
  );
  // zh prefers the zh role form when both exist.
  await expect(page.getByText("饰 杰尔索米娜")).toBeVisible();
});

test("role names split by locale: zh-only roles never reach /en", async ({ page }) => {
  await page.goto("/zh/film/otto-e-mezzo");
  await expect(page.getByText("饰 路易莎")).toBeVisible();

  await page.goto("/en/film/otto-e-mezzo");
  await expect(page.getByText("as Guido")).toBeVisible();
  await expect(page.getByText("路易莎")).toHaveCount(0);
});

test("the non-canonical person segment 308s to the canonical one", async ({ request }) => {
  for (const [source, destination] of [
    ["/zh/director/giulietta-masina", "/zh/actor/giulietta-masina"],
    ["/zh/actor/federico-fellini", "/zh/director/federico-fellini"],
    // en-pending person: the canonical check must run BEFORE the stub,
    // so the stub exists at exactly one URL.
    ["/en/director/anouk-aimee", "/en/actor/anouk-aimee"],
  ]) {
    const response = await request.get(source, hop);
    expect(response.status(), source).toBe(308);
    // permanentRedirect() may emit the (identical) Location header twice;
    // assert every value rather than the comma-folded concatenation.
    const locations = response
      .headersArray()
      .filter((h) => h.name.toLowerCase() === "location")
      .map((h) => h.value);
    expect(locations.length, source).toBeGreaterThan(0);
    for (const value of locations) expect(value, source).toBe(destination);
  }
});

test("en-pending actor renders the noindex stub at the canonical segment", async ({ page }) => {
  const response = await page.goto("/en/actor/anouk-aimee");
  expect(response?.status()).toBe(200);
  await expect(page.getByText("Translation Pending")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Anouk Aimée" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Read the Chinese edition/ })).toHaveAttribute(
    "href",
    "/zh/actor/anouk-aimee",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("film cast links curated people and leaves unlinked names plain", async ({ page }) => {
  await page.goto("/zh/film/otto-e-mezzo");
  await expect(page.getByRole("link", { name: "阿努克·艾梅" })).toHaveAttribute(
    "href",
    "/zh/actor/anouk-aimee",
  );
  await expect(page.getByText("马塞洛·马斯楚安尼")).toBeVisible();
  await expect(page.locator("a", { hasText: "马塞洛·马斯楚安尼" })).toHaveCount(0);
});

test("en actor page shows English bio and only en-published films", async ({ page }) => {
  await page.goto("/en/actor/giulietta-masina");
  await expect(page.getByText("Italian actor, Fellini's screen muse.")).toBeVisible();
  await expect(page.getByText("Films as Actor")).toBeVisible();
  await expect(page.getByRole("link", { name: "8½", exact: true })).toBeVisible();
  // la-strada is zh-only: the en subset rule keeps it out entirely.
  await expect(page.getByText("La strada")).toHaveCount(0);
});

test("sitemap lists person canonical URLs with the en subset rule", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain("/zh/actor/giulietta-masina");
  expect(xml).toContain("/en/actor/giulietta-masina");
  expect(xml).toContain("/zh/actor/anouk-aimee");
  expect(xml).not.toContain("/en/actor/anouk-aimee");
  expect(xml).toContain("/zh/director/federico-fellini");
  // Never the non-canonical segment.
  expect(xml).not.toContain("/zh/director/giulietta-masina");
});

test.describe("admin cast round-trip", () => {
  test.use({ storageState: "e2e/.auth/admin.json" });

  test("en person preview applies the en visibility rules", async ({ page }) => {
    const masina = await queryOne<{ id: string }>("select id from people where slug = $1", [
      "giulietta-masina",
    ]);
    await page.goto(`/admin/preview/person/${masina?.id}?locale=en`);
    await expect(page.getByText("Films as Actor")).toBeVisible();
    await expect(page.getByRole("link", { name: "8½", exact: true })).toBeVisible();
    // zh-only film: the published /en page hides it, so the preview must too.
    await expect(page.getByText("La strada")).toHaveCount(0);
  });

  test("cast rows persist with a person link and render linked on the film page", async ({
    page,
  }) => {
    await page.goto("/admin/films/new");
    await page.fill("#titleZh", "演员表测试");
    await page.fill("#titleOriginal", "Cast Roundtrip");
    await page.fill("#slug", "cast-roundtrip-film");
    await page.fill("#year", "1957");
    await page.getByLabel("费德里科·费里尼").check();
    await page.locator('textarea[name="editorialNote"]').fill(NOTE_200);

    await page.getByRole("button", { name: "添加演员" }).click();
    await page.locator('input[name="cast.0.name"]').fill("Giulietta Masina");
    await page.locator('input[name="cast.0.nameZh"]').fill("茱莉艾塔·玛西娜");
    await page.locator('input[name="cast.0.character"]').fill("Cabiria");
    await page.locator('select[name="cast.0.personId"]').selectOption({ label: "茱莉艾塔·玛西娜" });
    await page.click("button[type=submit]");
    await page.waitForURL(/\/admin\/films\/(?!new)[^/]+$/);

    // Round-trip: the edit form re-loads the persisted rows.
    await expect(page.locator('input[name="cast.0.name"]')).toHaveValue("Giulietta Masina");
    await expect(page.locator('select[name="cast.0.personId"]')).not.toHaveValue("");

    await page.getByRole("button", { name: "发布", exact: true }).click();
    await expect(page.locator("[data-sonner-toast]", { hasText: "已发布" })).toBeVisible();

    await page.goto("/zh/film/cast-roundtrip-film");
    await expect(page.getByRole("link", { name: "茱莉艾塔·玛西娜" })).toHaveAttribute(
      "href",
      "/zh/actor/giulietta-masina",
    );
    await expect(page.getByText("饰 Cabiria")).toBeVisible();
  });
});
