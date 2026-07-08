import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Migrations must bypass the connection pooler; locally there is only
    // one URL, so fall back to it. Empty string only when neither is set
    // (e.g. `generate` in CI, which never connects).
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
  casing: "snake_case",
});
