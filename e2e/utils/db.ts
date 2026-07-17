import { Client } from "pg";

const url = process.env.E2E_DATABASE_URL ?? "postgres://localhost:5432/roma_test";

/** One-shot query against the e2e database (specs run outside the app). */
export async function queryOne<T extends Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    const result = await client.query(sql, params);
    return (result.rows[0] as T) ?? null;
  } finally {
    await client.end();
  }
}

/** Holds a transaction-level row lock until the returned release function is called. */
export async function holdDatabaseLock(
  sql: string,
  params: unknown[] = [],
): Promise<() => Promise<void>> {
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("begin");
    await client.query(sql, params);
  } catch (error) {
    // The release callback was never handed out, so nothing else will
    // ever close this connection — do it here or leak it for the run.
    await client.end().catch(() => {});
    throw error;
  }
  let released = false;
  return async () => {
    if (released) return;
    released = true;
    try {
      await client.query("commit");
    } finally {
      await client.end();
    }
  };
}

export async function blockedTransactionCount(): Promise<number> {
  const row = await queryOne<{ n: number }>(
    "select count(*)::int as n from pg_stat_activity where datname = current_database() and pid <> pg_backend_pid() and wait_event_type = 'Lock'",
  );
  return row?.n ?? 0;
}

export async function queryErrorCode(sql: string, params: unknown[] = []): Promise<string | null> {
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(sql, params);
    return null;
  } catch (error) {
    return typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "unknown";
  } finally {
    await client.end();
  }
}
