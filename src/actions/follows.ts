"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { listFollows } from "@/db/schema";
import { requireUser } from "@/lib/auth-guards";
import { ok, type ActionResult } from "./result";

export async function setFollow(
  listId: string,
  following: boolean,
): Promise<ActionResult> {
  const session = await requireUser();
  if (following) {
    await db
      .insert(listFollows)
      .values({ userId: session.user.id, listId })
      .onConflictDoNothing();
  } else {
    await db
      .delete(listFollows)
      .where(
        and(
          eq(listFollows.userId, session.user.id),
          eq(listFollows.listId, listId),
        ),
      );
  }
  return ok();
}
