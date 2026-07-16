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
    page.locator("[data-sonner-toast]", { hasText: "至少要包含一部已发布影片" }),
  ).toBeVisible();
});

// The gate counted every item while the list page renders only published
// members, so a list holding nothing but drafts passed and went live as an
// empty <ol>. The empty-list test above never reached this: it had no items
// at all.
test("publish gate: list of only draft films blocked", async ({ page }) => {
  // Left as a draft on purpose — the film picker lists every film
  // regardless of status, which is how a draft-only list gets built.
  await page.goto("/admin/films/new");
  await page.fill("#titleZh", "草稿成员");
  await page.fill("#titleOriginal", "Draft Only Member");
  await page.fill("#slug", "draft-only-member");
  await page.fill("#year", "1970");
  await page.click("button[type=submit]");
  await page.waitForURL(/\/admin\/films\/(?!new)[^/]+$/);

  await page.goto("/admin/lists/new");
  await page.fill("#title", "只有草稿的片单");
  await page.fill("#slug", "draft-only-list-gate");
  await page.click("button[type=submit]");
  await page.waitForURL(/\/admin\/lists\/(?!new)[^/]+$/);

  await page.getByRole("combobox").selectOption({ label: "草稿成员（1970）" });
  await page.getByRole("button", { name: "加入" }).click();
  await expect(page.locator("[data-sonner-toast]", { hasText: "已加入" })).toBeVisible();

  await page.getByRole("button", { name: "发布", exact: true }).click();
  await expect(
    page.locator("[data-sonner-toast]", { hasText: "至少要包含一部已发布影片" }),
  ).toBeVisible();
});

// deleteFilm cascades to reader data (marks, user-list membership) and
// curated-list membership. A draft film that's referenced must be refused
// rather than silently taking that data with it — mirrors deleteDirector.
test("delete guard: a referenced draft film cannot be hard-deleted", async ({ page }) => {
  await page.goto("/admin/films/new");
  await page.fill("#titleZh", "被引用的草稿");
  await page.fill("#titleOriginal", "Referenced Draft");
  await page.fill("#slug", "referenced-draft-delete");
  await page.fill("#year", "1972");
  await page.click("button[type=submit]");
  await page.waitForURL(/\/admin\/films\/(?!new)[^/]+$/);

  await page.goto("/admin/lists/new");
  await page.fill("#title", "引用测试片单");
  await page.fill("#slug", "reference-delete-list");
  await page.click("button[type=submit]");
  await page.waitForURL(/\/admin\/lists\/(?!new)[^/]+$/);
  await page.getByRole("combobox").selectOption({ label: "被引用的草稿（1972）" });
  await page.getByRole("button", { name: "加入" }).click();
  await expect(page.locator("[data-sonner-toast]", { hasText: "已加入" })).toBeVisible();

  // Deletion is refused while the list references it.
  page.once("dialog", (d) => d.accept());
  await page.goto(`/admin/films/${await filmId("referenced-draft-delete")}`);
  await page.getByRole("button", { name: "删除", exact: true }).click();
  await expect(page.locator("[data-sonner-toast]", { hasText: "片单引用" })).toBeVisible();

  // Still there.
  const still = await queryOne<{ slug: string }>("select slug from films where slug = $1", [
    "referenced-draft-delete",
  ]);
  expect(still?.slug).toBe("referenced-draft-delete");
});

async function filmId(slug: string): Promise<string> {
  const row = await queryOne<{ id: string }>("select id from films where slug = $1", [slug]);
  return row?.id ?? "";
}

// publishList guarantees a published list has >= 1 published member.
// Two later mutations could break that: removing the last published
// member (blocked), and unpublishing the film that IS the last member
// (auto-unpublishes the list, since blocking the film edit is the wrong
// coupling). Both would otherwise leave the list rendering a bare <ol>.
test("empty-list invariant: last published member is protected", async ({ page }) => {
  // A published film (note + director) that will be a list's only member.
  await page.goto("/admin/films/new");
  await page.fill("#titleZh", "唯一成员");
  await page.fill("#titleOriginal", "Sole Member");
  await page.fill("#slug", "sole-member-film");
  await page.fill("#year", "1961");
  await page.getByLabel("费德里科·费里尼").check();
  await page.locator('textarea[name="editorialNote"]').fill(NOTE_200);
  await page.click("button[type=submit]");
  await page.waitForURL(/\/admin\/films\/(?!new)[^/]+$/);
  const filmUrl = page.url();
  await page.getByRole("button", { name: "发布", exact: true }).click();
  await expect(page.locator("[data-sonner-toast]", { hasText: "已发布" })).toBeVisible();

  // A published list containing only that film.
  await page.goto("/admin/lists/new");
  await page.fill("#title", "单成员片单");
  await page.fill("#slug", "sole-member-list");
  await page.click("button[type=submit]");
  await page.waitForURL(/\/admin\/lists\/(?!new)[^/]+$/);
  const listUrl = page.url();
  await page.getByRole("combobox").selectOption({ label: "唯一成员（1961）" });
  await page.getByRole("button", { name: "加入" }).click();
  await expect(page.locator("[data-sonner-toast]", { hasText: "已加入" })).toBeVisible();
  await page.getByRole("button", { name: "发布", exact: true }).click();
  await expect(page.locator("[data-sonner-toast]", { hasText: "已发布" })).toBeVisible();

  // (a) Removing the sole published member is refused.
  page.once("dialog", (d) => d.accept());
  // exact: the row itself is a role="button" whose name includes "移除".
  await page.getByRole("button", { name: "移除", exact: true }).click();
  await expect(
    page.locator("[data-sonner-toast]", { hasText: "最后一部已发布影片" }),
  ).toBeVisible();

  // (b) Unpublishing the film auto-unpublishes the now-empty list.
  await page.goto(filmUrl);
  await page.getByRole("button", { name: "撤回", exact: true }).click();
  await expect(page.locator("[data-sonner-toast]").last()).toBeVisible();
  const listStatus = await queryOne<{ status: string }>(
    "select status from curated_lists where slug = $1",
    ["sole-member-list"],
  );
  expect(listStatus?.status).toBe("draft");
  void listUrl;
});
