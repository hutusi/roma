"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-guards";
import { type ActionResult, fail, ok } from "./result";

/**
 * Role is written directly: better-auth's setRole only knows the
 * roles declared to its access-control system, and 'editor' is an
 * app-level concept enforced by our own guards. getSession reads the
 * user row per request (no cookie cache), so changes apply immediately.
 */
export async function setUserRole(
  userId: string,
  role: "admin" | "editor" | "user",
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (session.user.id === userId) return fail("不能修改自己的角色");
  await db.update(users).set({ role }).where(eq(users.id, userId));
  return ok();
}

export async function banUser(userId: string, reason: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (session.user.id === userId) return fail("不能封禁自己");
  await auth.api.banUser({
    body: { userId, banReason: reason || undefined },
    headers: await headers(),
  });
  return ok();
}

export async function unbanUser(userId: string): Promise<ActionResult> {
  await requireAdmin();
  await auth.api.unbanUser({ body: { userId }, headers: await headers() });
  return ok();
}
