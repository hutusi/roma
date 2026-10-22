import { expect, test } from "@playwright/test";
import { queryOne } from "./utils/db";

type Row = { is_china: boolean; value: number; country: string | null };

const beacon = (extra: Record<string, unknown>) =>
  JSON.stringify({ name: "LCP", value: 1234, rating: "good", ...extra });

// The beacon client is a thin sampled wrapper; the logic worth pinning is
// the ingest route — geo header → is_china tagging and payload validation,
// the plumbing the ADR 0008/0009 mainland-latency trigger depends on.

test("beacon from China is stored and tagged is_china", async ({ request }) => {
  const res = await request.post("/api/rum", {
    headers: { "x-vercel-ip-country": "CN" },
    data: beacon({ path: "/e2e/rum-cn" }),
  });
  expect(res.status()).toBe(204);

  const row = await queryOne<Row>(
    "select is_china, value, country from rum_events where path = $1 order by created_at desc limit 1",
    ["/e2e/rum-cn"],
  );
  expect(row).not.toBeNull();
  expect(row?.is_china).toBe(true);
  expect(row?.country).toBe("CN");
  expect(row?.value).toBeCloseTo(1234);
});

test("beacon from elsewhere is stored but not is_china", async ({ request }) => {
  const res = await request.post("/api/rum", {
    headers: { "x-vercel-ip-country": "US" },
    data: beacon({ path: "/e2e/rum-global" }),
  });
  expect(res.status()).toBe(204);

  const row = await queryOne<Row>(
    "select is_china, country from rum_events where path = $1 order by created_at desc limit 1",
    ["/e2e/rum-global"],
  );
  expect(row).not.toBeNull();
  expect(row?.is_china).toBe(false);
  expect(row?.country).toBe("US");
});

test("an invalid beacon is rejected and stored nothing", async ({ request }) => {
  const res = await request.post("/api/rum", {
    headers: { "x-vercel-ip-country": "CN" },
    data: JSON.stringify({ name: "NOT_A_METRIC", value: 1, path: "/e2e/rum-bad" }),
  });
  expect(res.status()).toBe(400);

  const row = await queryOne("select id from rum_events where path = $1 limit 1", ["/e2e/rum-bad"]);
  expect(row).toBeNull();
});

test("successful ingest opportunistically removes RUM older than 90 days", async ({ request }) => {
  await queryOne("delete from maintenance_runs where job = 'rum-retention' returning job");
  // Fixed-PK fixtures: clear leftovers first so a rerun against a
  // persistent database doesn't fail on a duplicate key (the 89-day row
  // deliberately survives retention).
  await queryOne(
    "delete from rum_events where id in ('rum-old-e2e', 'rum-recent-e2e') returning id",
  );
  await queryOne(
    "insert into rum_events (id, metric, value, path, is_china, created_at) values ('rum-old-e2e', 'LCP', 1, '/e2e/rum-old', false, now() - interval '91 days') returning id",
  );
  await queryOne(
    "insert into rum_events (id, metric, value, path, is_china, created_at) values ('rum-recent-e2e', 'LCP', 1, '/e2e/rum-recent', false, now() - interval '89 days') returning id",
  );

  const res = await request.post("/api/rum", {
    data: beacon({ path: "/e2e/rum-retention-trigger" }),
  });
  expect(res.status()).toBe(204);

  await expect
    .poll(async () =>
      queryOne<{ id: string }>("select id from rum_events where id = $1", ["rum-old-e2e"]),
    )
    .toBeNull();
  expect(
    await queryOne<{ id: string }>("select id from rum_events where id = $1", ["rum-recent-e2e"]),
  ).not.toBeNull();
});

test("the daily pass also drops rate-limit counters idle for a day", async ({ request }) => {
  await queryOne("delete from maintenance_runs where job = 'rate-limit-retention' returning job");
  await queryOne(
    "delete from rate_limits where id in ('rl-stale-e2e', 'rl-live-e2e') returning id",
  );
  const msAgo = (ms: number) => Date.now() - ms;
  await queryOne(
    "insert into rate_limits (id, key, count, last_request) values ('rl-stale-e2e', 'e2e-stale/sign-in', 1, $1), ('rl-live-e2e', 'e2e-live/sign-in', 1, $2) returning id",
    [msAgo(25 * 60 * 60 * 1000), msAgo(60 * 1000)],
  );

  const res = await request.post("/api/rum", {
    data: beacon({ path: "/e2e/rate-limit-retention-trigger" }),
  });
  expect(res.status()).toBe(204);

  await expect
    .poll(async () => queryOne("select id from rate_limits where id = 'rl-stale-e2e'"))
    .toBeNull();
  expect(await queryOne("select id from rate_limits where id = 'rl-live-e2e'")).not.toBeNull();
  await queryOne("delete from rate_limits where id = 'rl-live-e2e' returning id");
});
