import { userInfo } from "node:os";
import { defineConfig, devices } from "@playwright/test";

const PORT = 3105;
const baseURL = `http://localhost:${PORT}`;

// Fully specified on purpose: `next build` loads .env.production.local
// (a `vercel env pull` artifact carrying PGUSER/PGHOST/PGPASSWORD), and
// node-postgres fills any part missing from the URL from those vars —
// a user-less URL would silently target prod credentials. CI passes an
// explicit E2E_DATABASE_URL and never has the file.
const TEST_DATABASE_URL =
  process.env.E2E_DATABASE_URL ?? `postgres://${userInfo().username}@localhost:5432/roma_test`;

export default defineConfig({
  testDir: "./e2e",
  // One worker, no parallelism: specs share a single mutable database.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: "on-first-retry" },
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
      testIgnore: /.*\.setup\.ts/,
    },
  ],
  webServer: {
    // DB reset + build + start all live here: Playwright starts webServer
    // BEFORE globalSetup (microsoft/playwright#37237), and `next build`
    // prerenders pages that query Postgres — so provisioning cannot be a
    // globalSetup.
    command: "bun run e2e:server",
    url: baseURL,
    timeout: 300_000, // covers db reset + production build
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      DATABASE_URL_UNPOOLED: TEST_DATABASE_URL,
      BETTER_AUTH_URL: baseURL,
      BETTER_AUTH_SECRET:
        process.env.BETTER_AUTH_SECRET ?? "e2e-only-secret-0123456789abcdefghijklmnop",
      // Lets the password-reset loop run against a production build
      // without a Resend key; never set outside e2e.
      E2E_ALLOW_LOG_RESET: "1",
    },
  },
});
