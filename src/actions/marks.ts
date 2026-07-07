"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { userMarks } from "@/db/schema";
import { requireUser } from "@/lib/auth-guards";
import { type ActionResult, fail, ok } from "./result";

/**
 * One mark per user+film: setting watched overwrites want and vice
 * versa (upsert on the composite PK); null clears the mark. Marked
 * pages stay SSG-cached — user state never renders server-side there,
 * so no revalidation is needed.
 */
export async function setMark(
  filmId: string,
  status: "watched" | "want" | null,
): Promise<ActionResult> {
  const session = await requireUser();
  if (status === null) {
    await db
      .delete(userMarks)
      .where(and(eq(userMarks.userId, session.user.id), eq(userMarks.filmId, filmId)));
    return ok();
  }
  if (status !== "watched" && status !== "want") return fail("无效的标记");
  await db
    .insert(userMarks)
    .values({ userId: session.user.id, filmId, status })
    .onConflictDoUpdate({
      target: [userMarks.userId, userMarks.filmId],
      set: { status, updatedAt: new Date() },
    });
  return ok();
}
