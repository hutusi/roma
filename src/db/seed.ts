/**
 * Idempotent bootstrap: creates (or repairs) the first admin account.
 * Run with `bun run db:seed`; Bun loads .env.local automatically.
 * Override SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD for non-dev use.
 */
import { eq } from "drizzle-orm";
import { auth } from "../lib/auth";
import { db } from "./index";
import { users } from "./schema";

const email = process.env.SEED_ADMIN_EMAIL ?? "admin@babuban.com";

// The dev fallback is public knowledge (it's in this file) — never let
// it become an admin password on a non-local database. Parse the
// hostname: a substring test could be spoofed by credentials or a db
// name containing "localhost".
const isLocalDb = (() => {
  try {
    const { hostname } = new URL(process.env.DATABASE_URL ?? "");
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
})();
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
