"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { curatedLists, listFollows } from "@/db/schema";
import { requireUserResult } from "@/lib/auth-guards";
import { followInput } from "@/lib/validators/action-input";
import { type ActionResult, fail, failWith, isForeignKeyViolation, ok } from "./result";

/**
 * Follow or unfollow an editorial list. Only published lists can be
 * followed (a draft id is as good as unknown to a reader); unfollowing
 * always works, so a list that went back to draft can still be dropped.
 */
export async function setFollow(listId: string, following: boolean): Promise<ActionResult> {
  const guarded = await requireUserResult();
  if (!guarded.ok) return fail(guarded.error);
  const input = followInput.safeParse({ listId, following });
  if (!input.success) return fail("invalid");
  const userId = guarded.session.user.id;
  try {
    if (input.data.following) {
      const list = await db.query.curatedLists.findFirst({
        where: eq(curatedLists.id, input.data.listId),
        columns: { status: true },
      });
      if (list?.status !== "published") return fail("notFound");
      await db
        .insert(listFollows)
        .values({ userId, listId: input.data.listId })
        .onConflictDoNothing();
    } else {
      await db
        .delete(listFollows)
        .where(and(eq(listFollows.userId, userId), eq(listFollows.listId, input.data.listId)));
    }
    return ok();
  } catch (error) {
    // The list was deleted between the check and the insert.
    if (isForeignKeyViolation(error)) return fail("notFound");
    return failWith("failed", error, "setFollow");
  }
}
