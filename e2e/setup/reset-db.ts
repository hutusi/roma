/**
 * Drop, recreate, migrate, and seed the e2e database. Runs under Bun as
 * the first link of the `e2e:server` chain, before `next build` — the
 * build prerenders pages that query Postgres, so fixtures must exist
 * first. DATABASE_URL already points at the test DB (injected by
 * playwright.config webServer.env).
 */
import { spawnSync } from "node:child_process";
import { rm } from "node:fs/promises";
import { Client } from "pg";

// Stale reset-password URLs from a previous run would confuse the
// seo-ops spec.
await rm("e2e/.auth/reset-urls.log", { force: true });

const dbUrl = new URL(process.env.DATABASE_URL ?? "");
const dbName = dbUrl.pathname.slice(1);
if (!dbName.endsWith("_test")) {
  console.error(`Refusing to reset non-test database "${dbName}".`);
  process.exit(1);
}

const adminUrl = new URL(dbUrl.href);
adminUrl.pathname = "/postgres";
const maintenance = new Client({ connectionString: adminUrl.href });
await maintenance.connect();
await maintenance.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
await maintenance.query(`CREATE DATABASE "${dbName}"`);
await maintenance.end();

const migrate = spawnSync("bunx", ["drizzle-kit", "migrate"], {
  stdio: "inherit",
  env: process.env,
});
if (migrate.status !== 0) process.exit(migrate.status ?? 1);

// Import lazily — src/db builds its pool from env at import time, and the
// database has to exist first.
const { db } = await import("@/db");
const {
  curatedListItems,
  curatedLists,
  directors,
  filmDirectors,
  films,
  filmWatchLinks,
  users,
} = await import("@/db/schema");
const { auth } = await import("@/lib/auth");
const { eq } = await import("drizzle-orm");

// --- Accounts (via better-auth so password hashes are real)
await auth.api.signUpEmail({
  body: {
    email: "admin@e2e.test",
    password: "e2e-admin-password",
    name: "站长",
    username: "e2eadmin",
  },
});
await db.update(users).set({ role: "admin" }).where(eq(users.email, "admin@e2e.test"));
await auth.api.signUpEmail({
  body: {
    email: "user@e2e.test",
    password: "e2e-user-password",
    name: "读者甲",
    username: "e2euser",
  },
});

// --- Editorial fixtures
const doc = (nodes: Record<string, unknown>[]) => ({ type: "doc", content: nodes });
const p = (text: string) => ({ type: "paragraph", content: [{ type: "text", text }] });
const h2 = (text: string) => ({
  type: "heading",
  attrs: { level: 2 },
  content: [{ type: "text", text }],
});
const quote = (text: string) => ({ type: "blockquote", content: [p(text)] });

const NOTE =
  "费里尼在这部影片里把创作的困境本身拍成了电影：一个拍不出电影的导演，被记忆、欲望与负疚缠绕，最终在马戏团式的圆圈舞里与自己的人生和解。它是关于艺术家中年危机的最诚实的自白，也是电影语言的一次彻底解放——梦境、回忆与现实在同一个镜头里自由换场，不需要任何过渡的借口。黑白摄影在这里不是怀旧，而是让光成为叙事者：吉迪的白衬衫、修女的黑袍、浴场的蒸汽，都是心理的直接显影。半个多世纪过去，所有关于创作者自我怀疑的电影都活在它的阴影里。如果你只看一部费里尼，看这一部；如果你看过所有费里尼，再看一遍这一部。";

const [fellini] = await db
  .insert(directors)
  .values({
    slug: "federico-fellini",
    name: "Federico Fellini",
    nameZh: "费德里科·费里尼",
    bio: "意大利导演，1920–1993。从新现实主义出发，走向梦境。",
    careerEssay: doc([p("从《大路》到《八部半》，费里尼用二十年走完了从写实到自白的路。")]),
    status: "published",
    publishedAt: new Date(),
  })
  .returning();

const filmRows = await db
  .insert(films)
  .values([
    {
      slug: "otto-e-mezzo",
      titleZh: "八部半",
      titleZhHk: "八部半",
      titleZhTw: "八又二分之一",
      titleOriginal: "Otto e mezzo",
      titleEn: "8½",
      year: 1963,
      countries: ["意大利", "法国"],
      runtimeMinutes: 138,
      aspectRatio: "1.85:1",
      isBlackAndWhite: true,
      editorialNote: NOTE,
      essay: doc([h2("为什么是黑白版"), p("光影承担了原本属于色彩的全部叙事责任。"), quote("告别本来就不该匆忙。")]),
      castJson: [{ name: "Marcello Mastroianni", zhName: "马塞洛·马斯楚安尼", character: "Guido" }],
      status: "published",
      publishedAt: new Date(),
    },
    {
      slug: "la-strada",
      titleZh: "大路",
      titleOriginal: "La strada",
      year: 1954,
      countries: ["意大利"],
      isBlackAndWhite: true,
      editorialNote: NOTE,
      status: "published",
      publishedAt: new Date(),
    },
    {
      slug: "le-notti-di-cabiria",
      titleZh: "卡比利亚之夜",
      titleOriginal: "Le notti di Cabiria",
      year: 1957,
      countries: ["意大利"],
      isBlackAndWhite: true,
      editorialNote: NOTE,
      status: "published",
      publishedAt: new Date(),
    },
    {
      // Draft on purpose: must 404 publicly, render in preview, stay
      // hidden inside the published list below (draft-leak regression).
      slug: "il-bidone",
      titleZh: "骗子",
      titleOriginal: "Il bidone",
      year: 1955,
      countries: ["意大利"],
      isBlackAndWhite: true,
      editorialNote: NOTE,
      essay: doc([h2("草稿小节"), quote("这段只有编辑能看见。")]),
      status: "draft",
    },
  ])
  .returning();

const bySlug = Object.fromEntries(filmRows.map((f) => [f.slug, f]));

await db.insert(filmDirectors).values(
  filmRows.map((film) => ({ filmId: film.id, directorId: fellini.id, position: 0 })),
);

await db.insert(filmWatchLinks).values({
  filmId: bySlug["otto-e-mezzo"].id,
  platform: "Criterion Channel",
  region: "INTL",
  url: "https://www.criterionchannel.com/",
  sortOrder: 0,
});

const [primer] = await db
  .insert(curatedLists)
  .values({
    slug: "fellini-primer",
    title: "费里尼入门",
    theme: "从马戏团到罗马：费里尼的入口",
    intro: doc([p("按这个顺序看，你会看到一位导演如何长出翅膀。")]),
    status: "published",
    publishedAt: new Date(),
    sortOrder: 0,
  })
  .returning();

await db.insert(curatedListItems).values([
  {
    listId: primer.id,
    filmId: bySlug["la-strada"].id,
    position: 0,
    reasoning: doc([p("从这部开始：费里尼尚未离开新现实主义，却已长出翅膀。")]),
  },
  { listId: primer.id, filmId: bySlug["otto-e-mezzo"].id, position: 1 },
  // Draft film inside a published list — the leak regression fixture.
  { listId: primer.id, filmId: bySlug["il-bidone"].id, position: 2 },
]);

await db.insert(curatedLists).values({
  slug: "draft-list",
  title: "未发布片单",
  status: "draft",
  sortOrder: 99,
});

console.log(`e2e database "${dbName}" reset and seeded.`);
process.exit(0);
