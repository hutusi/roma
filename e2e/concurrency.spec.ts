import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { blockedTransactionCount, holdDatabaseLock, queryOne } from "./utils/db";

const NOTE = "并".repeat(220);

test.use({ storageState: "e2e/.auth/admin.json" });

async function publishedFilmIds() {
  const first = await queryOne<{ id: string }>("select id from films where slug = 'la-strada'");
  const second = await queryOne<{ id: string }>(
    "select id from films where slug = 'le-notti-di-cabiria'",
  );
  if (!first || !second) throw new Error("published film fixtures missing");
  return [first.id, second.id] as const;
}

async function createList(status: "draft" | "published" = "draft") {
  const id = randomUUID();
  const slug = `concurrency-${id}`;
  await queryOne(
    "insert into curated_lists (id, slug, title, status, sort_order, created_at, updated_at) values ($1, $2, '并发测试片单', $3, 0, now(), now()) returning id",
    [id, slug, status],
  );
  return id;
}

test("concurrent curated-list additions receive distinct positions", async ({ browser }) => {
  const listId = await createList();
  const [firstFilm, secondFilm] = await publishedFilmIds();
  const context = await browser.newContext({ storageState: "e2e/.auth/admin.json" });
  const firstPage = await context.newPage();
  const secondPage = await context.newPage();
  await Promise.all([
    firstPage.goto(`/admin/lists/${listId}`),
    secondPage.goto(`/admin/lists/${listId}`),
  ]);
  await firstPage.locator("select").first().selectOption(firstFilm);
  await secondPage.locator("select").first().selectOption(secondFilm);

  const release = await holdDatabaseLock("select id from curated_lists where id = $1 for update", [
    listId,
  ]);
  try {
    await Promise.all([
      firstPage.getByRole("button", { name: "加入" }).click(),
      secondPage.getByRole("button", { name: "加入" }).click(),
    ]);
    await expect.poll(blockedTransactionCount).toBeGreaterThanOrEqual(2);
  } finally {
    await release();
  }

  await expect
    .poll(async () =>
      queryOne<{ positions: number[] }>(
        "select array_agg(position order by position) as positions from curated_list_items where list_id = $1 having count(*) = 2",
        [listId],
      ),
    )
    .toEqual({ positions: [0, 1] });
  await context.close();
  await queryOne("delete from curated_lists where id = $1 returning id", [listId]);
});

test("two concurrent removals cannot empty a published list", async ({ browser }) => {
  const listId = await createList("published");
  const [firstFilm, secondFilm] = await publishedFilmIds();
  await queryOne(
    "insert into curated_list_items (id, list_id, film_id, position) values ($1, $3, $4, 0), ($2, $3, $5, 1) returning id",
    [randomUUID(), randomUUID(), listId, firstFilm, secondFilm],
  );

  const context = await browser.newContext({ storageState: "e2e/.auth/admin.json" });
  const firstPage = await context.newPage();
  const secondPage = await context.newPage();
  await Promise.all([
    firstPage.goto(`/admin/lists/${listId}`),
    secondPage.goto(`/admin/lists/${listId}`),
  ]);
  firstPage.once("dialog", (dialog) => dialog.accept());
  secondPage.once("dialog", (dialog) => dialog.accept());

  const release = await holdDatabaseLock("select id from curated_lists where id = $1 for update", [
    listId,
  ]);
  try {
    await Promise.all([
      firstPage.getByRole("button", { name: "移除", exact: true }).first().click(),
      secondPage.getByRole("button", { name: "移除", exact: true }).nth(1).click(),
    ]);
    await expect.poll(blockedTransactionCount).toBeGreaterThanOrEqual(2);
  } finally {
    await release();
  }

  await expect
    .poll(async () =>
      queryOne<{ status: string; items: number }>(
        "select l.status, count(i.id)::int as items from curated_lists l left join curated_list_items i on i.list_id = l.id where l.id = $1 group by l.id",
        [listId],
      ),
    )
    .toEqual({ status: "published", items: 1 });
  await context.close();
  await queryOne("delete from curated_lists where id = $1 returning id", [listId]);
});

test("concurrent film save and publish never leave invalid published content", async ({
  browser,
}) => {
  const id = randomUUID();
  const director = await queryOne<{ id: string }>(
    "select id from directors where slug = 'federico-fellini'",
  );
  if (!director) throw new Error("director fixture missing");
  await queryOne(
    "insert into films (id, slug, title_zh, title_original, year, countries, is_black_and_white, editorial_note, status, status_en, created_at, updated_at) values ($1, $2, '并发影片', 'Concurrent Film', 1964, '{}', true, $3, 'draft', 'draft', now(), now()) returning id",
    [id, `concurrent-film-${id}`, NOTE],
  );
  await queryOne(
    "insert into film_directors (film_id, director_id, position) values ($1, $2, 0) returning film_id",
    [id, director.id],
  );

  const context = await browser.newContext({ storageState: "e2e/.auth/admin.json" });
  const savePage = await context.newPage();
  const publishPage = await context.newPage();
  await Promise.all([savePage.goto(`/admin/films/${id}`), publishPage.goto(`/admin/films/${id}`)]);
  await savePage.locator('textarea[name="editorialNote"]').fill("太短");

  const release = await holdDatabaseLock("select id from films where id = $1 for update", [id]);
  try {
    await Promise.all([
      savePage.getByRole("button", { name: /^保存/ }).click(),
      publishPage.getByRole("button", { name: "发布", exact: true }).click(),
    ]);
    await expect.poll(blockedTransactionCount).toBeGreaterThanOrEqual(2);
  } finally {
    await release();
  }

  await expect
    .poll(async () =>
      queryOne<{ status: string; editorial_note: string }>(
        "select status, editorial_note from films where id = $1",
        [id],
      ).then(
        (row) =>
          row?.status === "draft" ||
          (row?.status === "published" && row.editorial_note.length >= 200),
      ),
    )
    .toBe(true);
  await context.close();
  await queryOne("delete from films where id = $1 returning id", [id]);
});

test("concurrent invitation grants preserve the highest role", async ({ browser }) => {
  const user = await queryOne<{ id: string }>(
    "update users set role = 'user' where email = 'user@e2e.test' returning id",
  );
  const admin = await queryOne<{ id: string }>(
    "select id from users where email = 'admin@e2e.test'",
  );
  if (!user || !admin) throw new Error("account fixtures missing");
  const editorToken = `editor-${randomUUID()}`;
  const adminToken = `admin-${randomUUID()}`;
  await queryOne(
    "insert into invitations (id, email, role, token, invited_by, expires_at, created_at) values ($1, 'user@e2e.test', 'editor', $2, $5, now() + interval '1 day', now()), ($3, 'user@e2e.test', 'admin', $4, $5, now() + interval '1 day', now()) returning id",
    [randomUUID(), editorToken, randomUUID(), adminToken, admin.id],
  );

  const context = await browser.newContext();
  const editorPage = await context.newPage();
  const adminPage = await context.newPage();
  await Promise.all([
    editorPage.goto(`/zh/invite/${editorToken}`),
    adminPage.goto(`/zh/invite/${adminToken}`),
  ]);
  for (const [page, suffix] of [
    [editorPage, "editor"],
    [adminPage, "admin"],
  ] as const) {
    await page.fill("#name", "并发邀请");
    await page.fill("#username", `concurrent-${suffix}`);
    await page.fill("#password", "concurrent-password");
  }

  const release = await holdDatabaseLock("select id from users where id = $1 for update", [
    user.id,
  ]);
  try {
    await Promise.all([
      editorPage.getByRole("button", { name: "接受邀请" }).click(),
      adminPage.getByRole("button", { name: "接受邀请" }).click(),
    ]);
    await expect.poll(blockedTransactionCount).toBeGreaterThanOrEqual(2);
  } finally {
    await release();
  }

  await expect
    .poll(async () => queryOne<{ role: string }>("select role from users where id = $1", [user.id]))
    .toEqual({ role: "admin" });
  await context.close();
  await queryOne("update users set role = 'user' where id = $1 returning id", [user.id]);
});
