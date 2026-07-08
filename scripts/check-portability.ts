/**
 * Guards the Cloudflare-exit constraints from ADR 0008 so they can't
 * erode by accident:
 *   1. No `@vercel/*` import outside the storage seam (src/lib/storage.ts).
 *   2. The DB handle keeps using node-postgres (Hyperdrive-compatible).
 *
 * Runs in CI via `bun run check:portability`; exits non-zero on any
 * violation so a PR that deepens Vercel lock-in fails the checks gate.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const STORAGE_SEAM = "lib/storage.ts";
// Static `from "@vercel/x"`, `require("@vercel/x")`, and dynamic
// `import("@vercel/x")`. A regex over source (not an AST) can be fooled
// by a @vercel/* mention inside a comment/string, but that fails safe
// (a false positive blocks CI, never a false pass) and keeps this guard
// dependency-free.
const VERCEL_IMPORT = /(?:from\s+|require\(\s*|import\(\s*)["']@vercel\/[^"']+["']/;

const violations: string[] = [];

// 1. @vercel/* imports confined to the storage seam.
const srcRoot = join(root, "src");
const files = readdirSync(srcRoot, { recursive: true, encoding: "utf8" }).filter((f) =>
  /\.(ts|tsx)$/.test(f),
);
for (const file of files) {
  const rel = file.split(/[\\/]/).join("/");
  if (rel === STORAGE_SEAM) continue;
  if (VERCEL_IMPORT.test(readFileSync(join(srcRoot, file), "utf8"))) {
    violations.push(
      `src/${rel}: imports a @vercel/* package — allowed only in src/${STORAGE_SEAM} (ADR 0008 constraint 1)`,
    );
  }
}

// 2. DB driver stays node-postgres (not neon-http), so Hyperdrive works.
if (!readFileSync(join(srcRoot, "db/index.ts"), "utf8").includes("drizzle-orm/node-postgres")) {
  violations.push(
    "src/db/index.ts: DB driver is no longer drizzle-orm/node-postgres (ADR 0008 constraint 2 / ADR 0003)",
  );
}

if (violations.length > 0) {
  console.error("Portability guard failed — see docs/adr/0008-vercel-now-cloudflare-exit.md:\n");
  for (const v of violations) console.error(`  ✗ ${v}`);
  process.exit(1);
}

console.log("Portability guard passed: Cloudflare-exit constraints intact.");
