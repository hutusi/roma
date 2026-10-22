import "server-only";
import { eq, lt } from "drizzle-orm";
import { db } from "@/db";
import type { DbTransaction } from "@/db/locks";
import { maintenanceRuns, rateLimits, rumEvents } from "@/db/schema";

const RUN_INTERVAL_MS = 24 * 60 * 60 * 1000;
const RUM_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
// better-auth's longest rate-limit window is a minute; a day leaves a
// wide margin and keeps any counter still in play.
const RATE_LIMIT_RETENTION_MS = 24 * 60 * 60 * 1000;

/**
 * Opportunistic fixed-policy cleanup, at most once a day per job. There
 * is no scheduler (ADR 0008 keeps the app portable), so the jobs ride on
 * RUM ingest. The maintenance row is the claim: concurrent callbacks
 * serialize on it, and the timestamp advances in the same transaction as
 * the deletion, so a failed cleanup stays immediately retryable.
 */
async function runDaily(
  job: string,
  now: Date,
  work: (tx: DbTransaction) => Promise<unknown>,
): Promise<boolean> {
  // Fast path, no transaction and no lock: this runs after EVERY beacon,
  // and on all but one request a day the answer is "nothing to do". Don't
  // pay for a lock queue to learn that.
  const [peek] = await db.select().from(maintenanceRuns).where(eq(maintenanceRuns.job, job));
  if (peek && now.getTime() - peek.lastSuccessfulRunAt.getTime() < RUN_INTERVAL_MS) return false;

  return db.transaction(async (tx) => {
    await tx
      .insert(maintenanceRuns)
      .values({ job, lastSuccessfulRunAt: new Date(0) })
      .onConflictDoNothing();
    // skipLocked: a concurrent pass already holds the claim — back off
    // instead of queuing behind it (the winner does the day's work).
    const [run] = await tx
      .select()
      .from(maintenanceRuns)
      .where(eq(maintenanceRuns.job, job))
      .for("update", { skipLocked: true });
    if (!run) return false;
    if (now.getTime() - run.lastSuccessfulRunAt.getTime() < RUN_INTERVAL_MS) return false;

    await work(tx);
    await tx
      .update(maintenanceRuns)
      .set({ lastSuccessfulRunAt: now })
      .where(eq(maintenanceRuns.job, job));
    return true;
  });
}

/** RUM older than 90 days goes: the comparisons look at recent weeks. */
export const runRumRetention = (now = new Date()) =>
  runDaily("rum-retention", now, (tx) =>
    tx.delete(rumEvents).where(lt(rumEvents.createdAt, new Date(now.getTime() - RUM_RETENTION_MS))),
  );

/**
 * better-auth keeps one counter row per IP and path and never deletes
 * one, so without this the table grows with every client that ever
 * signed in. Rows idle past any window count for nothing.
 */
export const runRateLimitRetention = (now = new Date()) =>
  runDaily("rate-limit-retention", now, (tx) =>
    tx
      .delete(rateLimits)
      .where(lt(rateLimits.lastRequest, now.getTime() - RATE_LIMIT_RETENTION_MS)),
  );
