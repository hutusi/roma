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

function createPool() {
  // Without DATABASE_URL, pg silently falls back to PG* variables and
  // then localhost — in production that is a wrong database or a hang,
  // never what anyone meant. Fail loudly instead. (Dev and the content
  // CLIs keep the fallback.)
  if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is not set");
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    // Client-side bounds, so a saturated pool or a stuck query fails as
    // an error the page or action can handle, instead of holding the
    // request until the platform kills the function. Server-side
    // statement_timeout is not sent as a startup parameter: Neon's
    // pooler rejects it (set it per role if it is ever wanted).
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
    query_timeout: 20_000,
  });
  // Without a listener, an idle-client disconnect (backend restart,
  // pooler timeout) emits an unhandled 'error' event and kills the
  // process. The pool discards the broken client; log and move on.
  pool.on("error", (error) => {
    console.error("Postgres pool idle-client error:", error);
  });
  return pool;
}

const pool = globalForDb.dbPool ?? createPool();

if (process.env.NODE_ENV !== "production") globalForDb.dbPool = pool;

export const db = drizzle({ client: pool, schema, casing: "snake_case" });
