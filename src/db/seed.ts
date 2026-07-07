/**
 * Idempotent bootstrap: creates (or repairs) the first admin account.
 * Run with `bun run db:seed`; Bun loads .env.local automatically.
 * Override SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD for non-dev use.
 */
import { eq } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema";
import { auth } from "../lib/auth";

const email = process.env.SEED_ADMIN_EMAIL ?? "admin@babuban.com";

// The dev fallback is public knowledge (it's in this file) — never let
// it become an admin password on a non-local database.
const isLocalDb = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL ?? "");
const password = process.env.SEED_ADMIN_PASSWORD ?? (isLocalDb ? "babuban-dev-admin" : null);
if (!password) {
  console.error("SEED_ADMIN_PASSWORD is required when seeding a non-local database.");
  process.exit(1);
}

const existing = await db.query.users.findFirst({
  where: eq(users.email, email),
});

if (existing) {
  if (existing.role !== "admin") {
    await db.update(users).set({ role: "admin" }).where(eq(users.id, existing.id));
    console.log(`Promoted existing user ${email} to admin.`);
  } else {
    console.log(`Admin ${email} already exists — nothing to do.`);
  }
} else {
  await auth.api.signUpEmail({
    body: { email, password, name: "站长", username: "admin" },
  });
  await db.update(users).set({ role: "admin" }).where(eq(users.email, email));
  console.log(`Created admin ${email} (password from SEED_ADMIN_PASSWORD or dev default).`);
}

process.exit(0);
