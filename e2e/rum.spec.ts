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
