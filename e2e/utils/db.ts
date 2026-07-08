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
