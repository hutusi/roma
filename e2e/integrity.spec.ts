import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { queryErrorCode, queryOne } from "./utils/db";

test("every reader/editorial film reference restricts hard deletion", async () => {
  const row = await queryOne<{ rules: Record<string, string> }>(`
    select json_object_agg(source_table, delete_rule) as rules
    from (
      select c.conrelid::regclass::text as source_table,
             case c.confdeltype when 'r' then 'restrict' else c.confdeltype::text end as delete_rule
      from pg_constraint c
      where c.contype = 'f'
        and c.confrelid = 'films'::regclass
        and c.conrelid in (
          'curated_list_items'::regclass,
          'director_viewing_items'::regclass,
          'user_list_items'::regclass,
          'user_marks'::regclass
        )
    ) protected_references
  `);
  expect(row?.rules).toEqual({
    curated_list_items: "restrict",
    director_viewing_items: "restrict",
    user_list_items: "restrict",
    user_marks: "restrict",
  });
});

test("film_cast credits cascade with their film and survive person deletion", async () => {
  const row = await queryOne<{ rules: Record<string, string> }>(`
    select json_object_agg(c.confrelid::regclass::text,
             case c.confdeltype when 'c' then 'cascade'
                                when 'n' then 'set null'
                                else c.confdeltype::text end) as rules
    from pg_constraint c
    where c.contype = 'f' and c.conrelid = 'film_cast'::regclass
  `);
  expect(row?.rules).toEqual({ films: "cascade", people: "set null" });
});

test("ordered list positions are unique and non-negative in the database", async () => {
  const listId = randomUUID();
  const first = await queryOne<{ id: string }>("select id from films where slug = 'la-strada'");
  const second = await queryOne<{ id: string }>(
    "select id from films where slug = 'le-notti-di-cabiria'",
  );
  if (!first || !second) throw new Error("film fixtures missing");
  await queryOne(
    "insert into curated_lists (id, slug, title, sort_order, created_at, updated_at) values ($1, $2, '约束测试', 0, now(), now()) returning id",
    [listId, `constraint-${listId}`],
  );
  await queryOne(
    "insert into curated_list_items (id, list_id, film_id, position) values ($1, $2, $3, 0) returning id",
    [randomUUID(), listId, first.id],
  );

  expect(
    await queryErrorCode(
      "insert into curated_list_items (id, list_id, film_id, position) values ($1, $2, $3, 0)",
      [randomUUID(), listId, second.id],
    ),
  ).toBe("23505");
  expect(
    await queryErrorCode(
      "insert into curated_list_items (id, list_id, film_id, position) values ($1, $2, $3, -1)",
      [randomUUID(), listId, second.id],
    ),
  ).toBe("23514");
  await queryOne("delete from curated_lists where id = $1 returning id", [listId]);

  const user = await queryOne<{ id: string }>("select id from users where email = 'user@e2e.test'");
  if (!user) throw new Error("user fixture missing");
  const userListId = randomUUID();
  await queryOne(
    "insert into user_lists (id, user_id, title, created_at, updated_at) values ($1, $2, '约束测试', now(), now()) returning id",
    [userListId, user.id],
  );
  await queryOne(
    "insert into user_list_items (id, list_id, film_id, position) values ($1, $2, $3, 0) returning id",
    [randomUUID(), userListId, first.id],
  );
  expect(
    await queryErrorCode(
      "insert into user_list_items (id, list_id, film_id, position) values ($1, $2, $3, 0)",
      [randomUUID(), userListId, second.id],
    ),
  ).toBe("23505");
  expect(
    await queryErrorCode(
      "insert into user_list_items (id, list_id, film_id, position) values ($1, $2, $3, -1)",
      [randomUUID(), userListId, second.id],
    ),
  ).toBe("23514");
  await queryOne("delete from user_lists where id = $1 returning id", [userListId]);
});

test("media attribution is non-null and nonblank in the database", async () => {
  expect(
    await queryErrorCode(
      "insert into media (id, url, pathname, credit, created_at) values ($1, '/x', 'x', null, now())",
      [randomUUID()],
    ),
  ).toBe("23502");
  expect(
    await queryErrorCode(
      "insert into media (id, url, pathname, credit, created_at) values ($1, '/x', 'x', '   ', now())",
      [randomUUID()],
    ),
  ).toBe("23514");
});
