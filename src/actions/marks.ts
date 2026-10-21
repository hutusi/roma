"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { userMarks } from "@/db/schema";
import { requireUserResult } from "@/lib/auth-guards";
import { markInput } from "@/lib/validators/action-input";
import { type ActionResult, fail, failWith, isForeignKeyViolation, ok } from "./result";

/**
 * One mark per user+film: setting watched overwrites want and vice
 * versa (upsert on the composite PK); null clears the mark. Marked
 * pages stay SSG-cached — user state never renders server-side there,
 * so no revalidation is needed. An expired session answers
 * "sessionExpired" rather than redirecting, so the island can drop back
 * to its sign-in prompt in place.
 */
export async function setMark(
  filmId: string,
  status: "watched" | "want" | null,
): Promise<ActionResult> {
  const guarded = await requireUserResult();
  if (!guarded.ok) return fail(guarded.error);
  const input = markInput.safeParse({ filmId, status });
  if (!input.success) return fail("invalid");
  const userId = guarded.session.user.id;
  try {
    if (input.data.status === null) {
      await db
        .delete(userMarks)
        .where(and(eq(userMarks.userId, userId), eq(userMarks.filmId, input.data.filmId)));
      return ok();
    }
    await db
      .insert(userMarks)
      .values({ userId, filmId: input.data.filmId, status: input.data.status })
      .onConflictDoUpdate({
        target: [userMarks.userId, userMarks.filmId],
        set: { status: input.data.status, updatedAt: new Date() },
      });
    return ok();
  } catch (error) {
    // user_marks.film_id is ON DELETE RESTRICT, so marking a film in the
    // instant it is deleted surfaces as an FK violation rather than a
    // silently vanishing row.
    if (isForeignKeyViolation(error)) return fail("notFound");
    return failWith("failed", error, "setMark");
  }
}
