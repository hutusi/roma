/**
 * First-load JavaScript per public route, gzipped, against a budget —
 * run after a production build (CI runs it after the e2e suite, which
 * builds). Fails when a route grows past its budget, so a stray import
 * (the admin's dnd-kit once rode into every user-list page) is caught
 * in review rather than in readers' bandwidth.
 *
 * Budgets sit just above today's sizes; raise one deliberately, in the
 * commit that justifies it.
 *
 * Run: bun run perf:budget
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const KB = 1024;

/** Default for public routes, and the exceptions that carry more by design. */
const DEFAULT_BUDGET = 180 * KB;
const BUDGETS: Record<string, number> = {
  // Signed-in forms ship the better-auth client.
  "/[lang]/account": 200 * KB,
  "/[lang]/sign-in": 195 * KB,
  "/[lang]/sign-up": 195 * KB,
  "/[lang]/forgot-password": 195 * KB,
  "/[lang]/reset-password": 195 * KB,
  "/[lang]/invite/[token]": 195 * KB,
  // Owner tools (list editing) load dnd-kit lazily; the panel itself stays.
  "/[lang]/u/[username]": 200 * KB,
  "/[lang]/u/[username]/list/[id]": 210 * KB,
};

type Row = { route: string; firstLoadChunkPaths: string[] };
const rows = JSON.parse(
  readFileSync(join(root, ".next/diagnostics/route-bundle-stats.json"), "utf8"),
) as Row[];

let over = 0;
for (const row of rows
  .filter((r) => r.route.startsWith("/[lang]"))
  .sort((a, b) => a.route.localeCompare(b.route))) {
  const gz = row.firstLoadChunkPaths.reduce(
    (n, p) => n + gzipSync(readFileSync(join(root, p))).length,
    0,
  );
  const budget = BUDGETS[row.route] ?? DEFAULT_BUDGET;
  const ok = gz <= budget;
  if (!ok) over++;
  console.log(
    `${ok ? "  " : "✗ "}${row.route.padEnd(34)} ${(gz / KB).toFixed(0).padStart(4)} KB gz / ${budget / KB} KB`,
  );
}
if (over) {
  console.error(`\n${over} route(s) over budget.`);
  process.exit(1);
}
