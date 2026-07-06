import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * node-postgres in every environment (local Postgres in dev, Neon's
 * pooled endpoint in production) rather than Neon's HTTP driver: the
 * HTTP driver cannot run interactive transactions, which list
 * reordering and the invite flow rely on, and driver parity keeps dev
 * behavior honest.
 *
 * The pool is cached on globalThis so Next.js dev-mode hot reloads
 * don't leak connections.
 */
const globalForDb = globalThis as unknown as { dbPool?: Pool };

const pool =
  globalForDb.dbPool ??
  new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });

if (process.env.NODE_ENV !== "production") globalForDb.dbPool = pool;

export const db = drizzle({ client: pool, schema, casing: "snake_case" });
