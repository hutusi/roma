import "server-only";
import { eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { maintenanceRuns, rumEvents } from "@/db/schema";

const JOB = "rum-retention";
const RUN_INTERVAL_MS = 24 * 60 * 60 * 1000;
const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Opportunistic fixed-policy cleanup. The maintenance row is the claim:
 * concurrent callbacks serialize on it, and the timestamp advances in the
 * same transaction as deletion so a failed cleanup remains immediately retryable.
 */
export async function runRumRetention(now = new Date()): Promise<boolean> {
  return db.transaction(async (tx) => {
    await tx
      .insert(maintenanceRuns)
      .values({ job: JOB, lastSuccessfulRunAt: new Date(0) })
      .onConflictDoNothing();
    const [run] = await tx
      .select()
      .from(maintenanceRuns)
      .where(eq(maintenanceRuns.job, JOB))
      .for("update");
    if (now.getTime() - run.lastSuccessfulRunAt.getTime() < RUN_INTERVAL_MS) return false;

    await tx
      .delete(rumEvents)
      .where(lt(rumEvents.createdAt, new Date(now.getTime() - RETENTION_MS)));
    await tx
      .update(maintenanceRuns)
      .set({ lastSuccessfulRunAt: now })
      .where(eq(maintenanceRuns.job, JOB));
    return true;
  });
}
