"use server";

import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { invitations, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-guards";
import { fail, ok, type ActionResult } from "./result";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function createInvite(
  email: string,
  role: "editor" | "admin",
): Promise<ActionResult<{ token: string }>> {
  await requireAdmin();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail("邮箱格式不正确");
  const token = nanoid(24);
  await db.insert(invitations).values({
    email,
    role,
    token,
    expiresAt: new Date(Date.now() + INVITE_TTL_MS),
  });
  return ok({ token });
}

export async function revokeInvite(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.delete(invitations).where(eq(invitations.id, id));
  return ok();
}

/**
 * Called from the public /invite/[token] page — no session required;
 * the token IS the authorization.
 */
export async function acceptInvite(
  token: string,
  values: { name: string; username: string; password: string },
): Promise<ActionResult> {
  const invite = await db.query.invitations.findFirst({
    where: eq(invitations.token, token),
  });
  if (!invite) return fail("邀请链接无效");
  if (invite.acceptedAt) return fail("邀请已被使用");
  if (invite.expiresAt < new Date()) return fail("邀请已过期");
  if (values.password.length < 8) return fail("密码至少 8 位");
  if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(values.username)) {
    return fail("用户名需为 3–30 位字母、数字或 _ . -");
  }

  const { error } = await auth.api
    .signUpEmail({
      body: {
        email: invite.email,
        password: values.password,
        name: values.name,
        username: values.username,
      },
    })
    .then(() => ({ error: null as string | null }))
    .catch((e: unknown) => ({
      error: e instanceof Error ? e.message : "注册失败",
    }));
  if (error) return fail(error);

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ role: invite.role })
      .where(eq(users.email, invite.email));
    await tx
      .update(invitations)
      .set({ acceptedAt: new Date() })
      .where(eq(invitations.id, invite.id));
  });
  return ok();
}
