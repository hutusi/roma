"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { lockUser } from "@/db/locks";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-guards";
import { roleInput, rowId } from "@/lib/validators/action-input";
import { type ActionResult, fail, failWith, ok } from "./result";

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
  // users.role is free text in the schema; this enum is the only thing
  // standing between a crafted request and an arbitrary role string.
  const parsedRole = roleInput.safeParse(role);
  if (!parsedRole.success) return fail("无效的角色");
  if (!rowId.safeParse(userId).success) return fail("用户不存在");
  if (session.user.id === userId) return fail("不能修改自己的角色");
  const updated = await db.transaction(async (tx) => {
    const user = await lockUser(tx, userId);
    if (!user) return false;
    await tx.update(users).set({ role: parsedRole.data }).where(eq(users.id, userId));
    return true;
  });
  return updated ? ok() : fail("用户不存在");
}

export async function banUser(userId: string, reason: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!rowId.safeParse(userId).success) return fail("用户不存在");
  if (session.user.id === userId) return fail("不能封禁自己");
  const banReason = typeof reason === "string" ? reason.trim().slice(0, 500) : "";
  try {
    await auth.api.banUser({
      body: { userId, banReason: banReason || undefined },
      headers: await headers(),
    });
  } catch (error) {
    // better-auth throws APIError (English text) for an unknown user or a
    // stale admin session; the admin is zh-only, so the cause is logged.
    return failWith("封禁失败，请刷新后重试", error, "banUser");
  }
  return ok();
}

export async function unbanUser(userId: string): Promise<ActionResult> {
  await requireAdmin();
  if (!rowId.safeParse(userId).success) return fail("用户不存在");
  try {
    await auth.api.unbanUser({ body: { userId }, headers: await headers() });
  } catch (error) {
    return failWith("解除封禁失败，请刷新后重试", error, "unbanUser");
  }
  return ok();
}
