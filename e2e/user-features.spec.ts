import { readFileSync } from "node:fs";
import { type Browser, expect, type Page, test } from "@playwright/test";
import { queryOne } from "./utils/db";

const activeClass = /bg-brand/;

test.describe("reader", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("marks persist and overwrite; no leakage to another account on the cached page", async ({
    page,
    browser,
  }) => {
    await page.goto("/zh/film/la-strada");
    // Wait for the server action itself, not a guessed duration: the
    // button flips optimistically before the write lands.
    await Promise.all([
      page.waitForResponse((r) => r.request().method() === "POST" && r.ok()),
      page.getByRole("button", { name: "看过" }).click(),
    ]);
    await page.reload();
    await expect(page.getByRole("button", { name: "看过" })).toHaveClass(activeClass, {
      timeout: 10_000,
    });

    await Promise.all([
      page.waitForResponse((r) => r.request().method() === "POST" && r.ok()),
      page.getByRole("button", { name: "想看" }).click(),
    ]);
    await page.reload();
    await expect(page.getByRole("button", { name: "想看" })).toHaveClass(activeClass, {
      timeout: 10_000,
    });
    await expect(page.getByRole("button", { name: "看过" })).not.toHaveClass(activeClass);

    // Same (SSG-cached) page through a different account: no marks.
    const other = await browser.newContext({ storageState: "e2e/.auth/admin.json" });
    const otherPage = await other.newPage();
    await otherPage.goto("/zh/film/la-strada");
    await expect(otherPage.getByRole("button", { name: "看过" })).toBeVisible();
    await expect(otherPage.getByRole("button", { name: "看过" })).not.toHaveClass(activeClass);
    await expect(otherPage.getByRole("button", { name: "想看" })).not.toHaveClass(activeClass);
    await other.close();
  });

  test("profile tab reflects the want mark", async ({ page }) => {
    await page.goto("/zh/u/e2euser?tab=want");
    await expect(page.locator('a[href="/zh/film/la-strada"]')).toBeVisible();
  });

  test("follow shows up in /me/follows", async ({ page }) => {
    await page.goto("/zh/list/fellini-primer");
    await Promise.all([
      page.waitForResponse((r) => r.request().method() === "POST" && r.ok()),
      page.getByRole("button", { name: "关注片单" }).click(),
    ]);
    await page.goto("/zh/me/follows");
    await expect(page.locator('a[href="/zh/list/fellini-primer"]')).toBeVisible();
  });

  test("user list: created, filled, and readable by others without the owner panel", async ({
    page,
    browser,
  }) => {
    await page.goto("/zh/u/e2euser?tab=lists");
    await page.getByRole("button", { name: "新建片单" }).click();
    await page.fill("#title", "我的黑白十佳");
    await page.getByRole("button", { name: "创建", exact: true }).click();
    await page.waitForURL(/\/u\/e2euser\/list\/[^/]+$/);
    const listUrl = page.url();

    await page.locator("select").first().selectOption({ label: "大路（1954）" });
    await page.getByRole("button", { name: "加入" }).click();
    await expect(page.locator('a[href^="/zh/film/"]').first()).toBeVisible({ timeout: 15_000 });

    const stranger = await browser.newContext({ storageState: "e2e/.auth/admin.json" });
    const strangerPage = await stranger.newPage();
    await strangerPage.goto(listUrl);
    await expect(strangerPage.getByText("我的黑白十佳")).toBeVisible();
    await expect(strangerPage.getByText("这是你的片单")).toHaveCount(0);
    await stranger.close();
  });

  // When an editor pulls a film, the owner's copy used to vanish from
  // their own panel while the row stayed in the table: they couldn't
  // remove it, and every later drag sent a partial permutation that
  // silently collided positions.
  test("user list: an unpublished member becomes a removable placeholder for its owner", async ({
    page,
    browser,
  }) => {
    // A throwaway film — unpublishing a seeded one would race the specs
    // that assert it renders.
    const admin = await browser.newContext({ storageState: "e2e/.auth/admin.json" });
    const adminPage = await admin.newPage();
    await adminPage.goto("/admin/films/new");
    await adminPage.fill("#titleZh", "临时成员");
    await adminPage.fill("#titleOriginal", "Temp Member");
    await adminPage.fill("#slug", "temp-unpublish-member");
    await adminPage.fill("#year", "1975");
    await adminPage.getByLabel("费德里科·费里尼").check();
    await adminPage.locator('textarea[name="introduction"]').fill("字".repeat(220));
    await adminPage.click("button[type=submit]");
    await adminPage.waitForURL(/\/admin\/films\/(?!new)[^/]+$/);
    const filmAdminUrl = adminPage.url();
    await adminPage.getByRole("button", { name: "发布", exact: true }).click();
    await expect(adminPage.locator("[data-sonner-toast]", { hasText: "已发布" })).toBeVisible();

    await page.goto("/zh/u/e2euser?tab=lists");
    await page.getByRole("button", { name: "新建片单" }).click();
    await page.fill("#title", "下架测试片单");
    await page.getByRole("button", { name: "创建", exact: true }).click();
    await page.waitForURL(/\/u\/e2euser\/list\/[^/]+$/);
    const listUrl = page.url();

    // The owner panel has no success toast — it just refreshes, so wait
    // on the rendered card instead.
    for (const [label, slug] of [
      ["临时成员（1975）", "temp-unpublish-member"],
      ["大路（1954）", "la-strada"],
    ]) {
      await page.locator("select").first().selectOption({ label });
      await page.getByRole("button", { name: "加入" }).click();
      await expect(page.locator(`a[href="/zh/film/${slug}"]`)).toBeVisible({ timeout: 15_000 });
    }

    await adminPage.goto(filmAdminUrl);
    await adminPage.getByRole("button", { name: "撤回", exact: true }).click();
    await expect(adminPage.locator("[data-sonner-toast]").last()).toBeVisible();

    await page.goto(listUrl);
    // The owner sees it as unavailable — with no title, since it's
    // unpublished editorial work and they aren't an editor.
    await expect(page.getByText("该影片暂不可用（已下架）")).toBeVisible();
    await expect(page.getByText("临时成员")).toHaveCount(0);
    // The still-published member is untouched.
    await expect(page.locator('a[href="/zh/film/la-strada"]')).toBeVisible();

    // And they can get unstuck: the row carries its own remove button
    // (SortableList rows are divs, so scope to the row, not an <li>).
    await page
      .locator("div.border-line", { hasText: "该影片暂不可用（已下架）" })
      .getByRole("button", { name: "移除" })
      .click();
    await expect(page.getByText("该影片暂不可用（已下架）")).toHaveCount(0);
    // Removing the placeholder must not take the good member with it.
    await expect(page.locator('a[href="/zh/film/la-strada"]')).toBeVisible();
    await admin.close();
  });
});

// The session store caches marks per film and doesn't re-read a film it
// has answered for. When a refresh found a different reader (the account
// changed in another tab, or on a shared machine), the last reader's
// marks used to carry over to them.
const SWITCH_FILM = "le-notti-di-cabiria";

/**
 * The reader has 看过 on SWITCH_FILM and the page open; then the account
 * changes behind the tab's back and the reader soft-navigates to /zh/films.
 */
async function switchAccountsAway(browser: Browser) {
  await queryOne(
    "insert into user_marks (user_id, film_id, status) select u.id, f.id, 'watched' from users u, films f where u.username = 'e2euser' and f.slug = $1 on conflict do nothing returning status",
    [SWITCH_FILM],
  );
  const context = await browser.newContext({ storageState: "e2e/.auth/user.json" });
  const page = await context.newPage();
  await page.clock.install();
  await page.goto(`/zh/film/${SWITCH_FILM}`);
  await expect(page.getByRole("button", { name: "看过" })).toHaveAttribute("aria-pressed", "true");

  const admin = JSON.parse(readFileSync("e2e/.auth/admin.json", "utf8"));
  await context.clearCookies();
  await context.addCookies(admin.cookies);
  await page.getByRole("banner").getByRole("link", { name: "影片", exact: true }).click();
  await expect(page).toHaveURL(/\/zh\/films$/);
  return { context, page };
}

/** Past the 30s refresh window, the tab comes back into view. */
async function refreshSession(page: Page) {
  await page.clock.fastForward(31_000);
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
}

const dropSwitchMark = () =>
  queryOne(
    "delete from user_marks where user_id = (select id from users where username = 'e2euser') and film_id = (select id from films where slug = $1) returning status",
    [SWITCH_FILM],
  );

test("a different reader in the same browser never sees the last one's marks", async ({
  browser,
}) => {
  const { context, page } = await switchAccountsAway(browser);
  await refreshSession(page);
  await expect(page.getByRole("banner")).toContainText("站长");

  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`/zh/film/${SWITCH_FILM}$`));
  await expect(page.getByRole("button", { name: "看过" })).toHaveAttribute("aria-pressed", "false");

  await context.close();
  await dropSwitchMark();
});

// The refresh may still be in flight when the reader returns to a visited
// film: its island finds the answer cached and asks for nothing, then the
// new reader's answer drops that cache. Without a follow-up request the
// mark buttons stayed on their placeholder for good.
test("a reader change landing mid-navigation still answers for the film on screen", async ({
  browser,
}) => {
  const { context, page } = await switchAccountsAway(browser);
  await page.route("**/api/me/state**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1_500));
    await route.continue();
  });
  await refreshSession(page);
  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`/zh/film/${SWITCH_FILM}$`));

  await expect(page.getByRole("banner")).toContainText("站长");
  await expect(page.getByRole("button", { name: "看过" })).toHaveAttribute("aria-pressed", "false");

  await context.close();
  await dropSwitchMark();
});

test.describe("guest", () => {
  test("sees sign-in hints instead of interactive buttons", async ({ page }) => {
    await page.goto("/zh/film/la-strada");
    await expect(page.getByText("登录后可标记")).toBeVisible();
    await page.goto("/zh/me/follows");
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
