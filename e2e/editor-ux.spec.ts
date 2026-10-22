import { randomUUID } from "node:crypto";
import { expect, type Page, test } from "@playwright/test";
import { queryOne } from "./utils/db";

/**
 * The editing desk's own affordances: the essay toolbar's dialogs, image
 * credits from the library through to the page, and a media library that
 * shows its filters and doesn't pretend a refused change was saved.
 */

test.use({ storageState: "e2e/.auth/admin.json" });

async function draftFilm() {
  const id = randomUUID();
  await queryOne(
    "insert into films (id, slug, title_zh, title_original, year, countries, is_black_and_white, status, status_en, created_at, updated_at) values ($1, $2, '编辑体验', 'Editor UX', 1967, '{}', true, 'draft', 'draft', now(), now()) returning id",
    [id, `editor-ux-${id}`],
  );
  // The form won't save without a director.
  await queryOne(
    "insert into film_directors (film_id, director_id, position) select $1, id, 0 from people where slug = 'federico-fellini' returning film_id",
    [id],
  );
  return id;
}

const dropFilm = (id: string) => queryOne("delete from films where id = $1 returning id", [id]);

const toast = (page: Page, text: string | RegExp) =>
  page.locator("[data-sonner-toast]", { hasText: text });

test("an essay link is added in a dialog that says why an address is refused", async ({ page }) => {
  const id = await draftFilm();
  await page.goto(`/admin/films/${id}`);
  const essay = page.locator('.ProseMirror[aria-label="长文"]');
  await essay.click();
  await page
    .getByRole("toolbar", { name: "长文 · 格式", exact: true })
    .getByRole("button", { name: "链接" })
    .click();

  const dialog = page.getByRole("dialog", { name: "添加链接" });
  await dialog.getByLabel("地址").fill("www.example.com");
  await dialog.getByRole("button", { name: "添加" }).click();
  await expect(dialog.getByRole("alert")).toContainText("https://");

  await dialog.getByLabel("地址").fill("https://example.com/");
  await dialog.getByRole("button", { name: "添加" }).click();
  await expect(dialog).toBeHidden();
  // Nothing selected: the address went in as the link's text…
  await expect(essay.locator('a[href="https://example.com/"]')).toHaveText("https://example.com/");
  // …and the dialog's submit didn't save the film form around it.
  await expect(page.getByText("有未保存的修改")).toBeVisible();

  await dropFilm(id);
});

test("a formatted essay saves, and its image carries the library credit onto the page", async ({
  page,
}) => {
  const id = await draftFilm();
  await page.goto(`/admin/films/${id}`);
  const essay = page.locator('.ProseMirror[aria-label="长文"]');
  const toolbar = page.getByRole("toolbar", { name: "长文 · 格式", exact: true });
  await essay.click();
  // A heading too: anything with attrs (headings, links, images) used to
  // reach the action as a null-prototype object and fail to save.
  await toolbar.getByRole("button", { name: "二级标题" }).click();
  await expect(toolbar.getByRole("button", { name: "二级标题" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.keyboard.type("镜中的导演");
  await page.keyboard.press("Enter");
  await toolbar.getByRole("button", { name: "插入图片" }).click();

  const dialog = page.getByRole("dialog", { name: "从媒体库插入图片" });
  await dialog.getByRole("searchbox", { name: "搜索图片" }).fill("otto-still");
  await dialog.getByRole("button", { name: "8½ still" }).click();
  // Second step, same dialog: it asks for the alt text in context.
  const altStep = page.getByRole("dialog", { name: "图片说明" });
  await altStep.getByLabel("替代文字").fill("圭多在片场");
  await altStep.getByRole("button", { name: "插入" }).click();
  await expect(essay.locator("img")).toHaveAttribute("alt", "圭多在片场");

  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(toast(page, "已保存")).toBeVisible();

  // The preview opens in the site's own chrome, credit under the image.
  await page.goto(`/admin/preview/film/${id}`);
  await expect(page.getByRole("link", { name: "返回编辑" })).toBeVisible();
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("heading", { name: "镜中的导演" })).toBeVisible();
  await expect(page.locator("figure", { has: page.getByAltText("圭多在片场") })).toContainText(
    "图片来源：TMDB",
  );

  await dropFilm(id);
});

test("opening an essay to look at it doesn't count as an edit", async ({ page }) => {
  // 八部半's essay ends in a blockquote, so the editor normalizes it by
  // appending an empty paragraph — which used to mark the form dirty.
  const film = await queryOne<{ id: string }>("select id from films where slug = 'otto-e-mezzo'");
  await page.goto(`/admin/films/${film?.id}`);
  const toolbar = page.getByRole("toolbar", { name: "长文 · 格式", exact: true });
  await page.locator('.ProseMirror[aria-label="长文"]').getByRole("heading").click();
  // The click's transaction has been processed once the toolbar follows it.
  await expect(toolbar.getByRole("button", { name: "二级标题" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByText("没有修改")).toBeVisible();
  await expect(toolbar.getByRole("button", { name: "撤销" })).toBeDisabled();
});

test("the media library shows its film filter, and a refused change rolls back", async ({
  page,
}) => {
  const film = await queryOne<{ id: string }>("select id from films where slug = 'otto-e-mezzo'");
  await page.goto(`/admin/media?filmId=${film?.id}`);
  await expect(page.getByText("仅显示《八部半》的图片")).toBeVisible();

  const card = page.getByRole("article", { name: "8½ still" });
  const kind = card.getByRole("combobox", { name: "类型" });
  await expect(kind).toHaveValue("still");

  // Server actions POST to the page URL; drop exactly those.
  await page.route("**/admin/media**", (route) =>
    route.request().method() === "POST" ? route.abort("failed") : route.continue(),
  );
  await kind.selectOption("poster");
  await expect(toast(page, "操作没有完成")).toBeVisible();
  await expect(kind).toHaveValue("still");
  await page.unroute("**/admin/media**");

  await page.getByRole("link", { name: "显示全部" }).click();
  await expect(page).toHaveURL(/\/admin\/media$/);
  await expect(page.getByText(/^仅显示/)).toHaveCount(0);
});

// An essay stores an image by URL and looks its credit up from the library
// row at render time, so deleting a row an essay still used left the
// published essay drawing the image uncredited, or broken once the blob
// went too.
test("an image an essay still uses can't be deleted from the library", async ({ page }) => {
  const id = await draftFilm();
  const image = await queryOne<{ url: string }>("select url from media where alt = '8½ still'");
  await queryOne("update films set essay = $2::jsonb where id = $1 returning id", [
    id,
    JSON.stringify({ type: "doc", content: [{ type: "image", attrs: { src: image?.url } }] }),
  ]);
  try {
    const film = await queryOne<{ id: string }>("select id from films where slug = 'otto-e-mezzo'");
    await page.goto(`/admin/media?filmId=${film?.id}`);
    const card = page.getByRole("article", { name: "8½ still" });
    await card.getByRole("button", { name: "删除" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "删除" }).click();
    await expect(toast(page, "这张图片仍在长文中使用：《编辑体验》")).toBeVisible();
    await expect(card).toBeVisible();
  } finally {
    await dropFilm(id);
  }
});

test("an English essay's image alt starts empty, not in Chinese", async ({ page }) => {
  const id = await draftFilm();
  await page.goto(`/admin/films/${id}`);
  await page.locator('.ProseMirror[aria-label="英文长文"]').click();
  await page
    .getByRole("toolbar", { name: "英文长文 · 格式", exact: true })
    .getByRole("button", { name: "插入图片" })
    .click();
  await page.getByRole("dialog").getByRole("button", { name: "8½ still" }).click();
  // The library's alt is written for the zh edition.
  await expect(page.getByRole("dialog", { name: "图片说明" }).getByLabel("替代文字")).toHaveValue(
    "",
  );
  await dropFilm(id);
});
