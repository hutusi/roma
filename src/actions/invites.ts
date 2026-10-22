"use server";

import { and, eq, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db } from "@/db";
import { lockUser } from "@/db/locks";
import { invitations, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-guards";
import { rowId } from "@/lib/validators/action-input";
import { type ActionResult, fail, failWith, ok } from "./result";

const acceptValues = z.object({
  name: z.string().trim().min(1).max(50),
  username: z.string(),
  password: z.string().max(200),
});

/**
 * better-auth's sign-up errors arrive as English APIError text; the
 * invite page is zh-only. Known codes get their own message, anything
 * else a generic one with the cause logged.
 */
const SIGN_UP_ERRORS: Record<string, string> = {
  USERNAME_IS_ALREADY_TAKEN: "该用户名已被占用，请换一个",
  USERNAME_IS_ALREADY_TAKEN_PLEASE_TRY_ANOTHER: "该用户名已被占用，请换一个",
  USER_ALREADY_EXISTS: "该邮箱已注册，请直接登录",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "该邮箱已注册，请直接登录",
  PASSWORD_TOO_SHORT: "密码至少 8 位",
  PASSWORD_TOO_LONG: "密码过长",
  INVALID_USERNAME: "用户名需为 3–30 位字母、数字或 _ . -",
};

function signUpErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const body = (error as { body?: { code?: unknown } }).body;
  return typeof body?.code === "string" ? body.code : undefined;
}

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const INVITE_ROLES = ["editor", "admin"] as const;
type InviteRole = (typeof INVITE_ROLES)[number];

/**
 * Better Auth lowercases the address before creating the user row, and
 * users.email is plain text (case-sensitive in Postgres). Every read and
 * write of an invitation email goes through this so the invitation and
 * the account it promotes can never disagree on case. Applied on read as
 * well as write, so invitations stored before this normalization existed
 * still resolve without a backfill.
 */
const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function createInvite(
  email: string,
  role: InviteRole,
): Promise<ActionResult<{ token: string }>> {
  const session = await requireAdmin();
  const normalized = normalizeEmail(email);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized)) return fail("邮箱格式不正确");
  // Server actions are public endpoints; the param's type is not a guard.
  if (!INVITE_ROLES.includes(role)) return fail("无效的角色");
  const token = nanoid(24);
  await db.insert(invitations).values({
    email: normalized,
    role,
    token,
    invitedBy: session.user.id,
    expiresAt: new Date(Date.now() + INVITE_TTL_MS),
  });
  return ok({ token });
}

/**
 * Only pending invitations can be revoked: an accepted one is the record
 * of how an editor joined, and deleting it would erase that.
 */
export async function revokeInvite(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!rowId.safeParse(id).success) return fail("邀请不存在");
  const deleted = await db
    .delete(invitations)
    .where(and(eq(invitations.id, id), isNull(invitations.acceptedAt)))
    .returning({ id: invitations.id });
  return deleted.length ? ok() : fail("邀请不存在或已被接受");
}

/**
 * Thrown only to roll the transaction back, and mapped straight to
 * fail() by the caller — server actions must return ActionResult, since
 * production masks thrown messages into a generic error.
 */
class ClaimFailure extends Error {
  constructor(readonly userMessage: string) {
    super(userMessage);
  }
}

/** user < editor < admin. An unknown/null role is a plain user, matching roleOf(). */
const ROLE_RANK: Record<string, number> = { user: 0, editor: 1, admin: 2 };
const rank = (role: string | null | undefined) => ROLE_RANK[role ?? "user"] ?? 0;

/**
 * Promotes `userId` and claims the invitation as one unit. The locked rows
 * serialize both duplicate claims and distinct grants for the same account;
 * the latter always recompute rank from the latest committed role.
 */
async function promoteAndClaim(userId: string, inviteId: string) {
  return db.transaction(async (tx) => {
    // Invitation → user is the canonical claim order. Distinct invites
    // for one address then serialize on the same user row, so each rank
    // decision observes the role committed by the previous claim.
    const [invite] = await tx
      .select()
      .from(invitations)
      .where(eq(invitations.id, inviteId))
      .for("update");
    if (!invite) throw new ClaimFailure("邀请链接无效");
    if (invite.acceptedAt) throw new ClaimFailure("邀请已被使用");
    if (invite.expiresAt < new Date()) throw new ClaimFailure("邀请已过期");

    const user = await lockUser(tx, userId);
    if (!user) throw new ClaimFailure("账号不存在，请重新接受邀请");
    if (normalizeEmail(user.email) !== normalizeEmail(invite.email)) {
      throw new ClaimFailure("邀请邮箱与账号不匹配");
    }
    const role = rank(user.role) >= rank(invite.role) ? (user.role ?? "user") : invite.role;
    if (role !== user.role) {
      await tx.update(users).set({ role }).where(eq(users.id, userId));
    }

    const claimed = await tx
      .update(invitations)
      .set({ acceptedAt: new Date() })
      .where(and(eq(invitations.id, inviteId), isNull(invitations.acceptedAt)))
      .returning({ id: invitations.id });
    if (!claimed.length) throw new ClaimFailure("邀请已被使用");
  });
}

/**
 * Called from the public /invite/[token] page — no session required;
 * the token IS the authorization.
 *
 * `signedIn` is false when the address already had an account: signup
 * (which is what establishes the session) is skipped, so the caller must
 * send them to sign in rather than to /admin. That path also recovers a
 * previous attempt that created the account but failed before promoting.
 */
export async function acceptInvite(
  token: string,
  values: { name: string; username: string; password: string },
): Promise<ActionResult<{ signedIn: boolean }>> {
  const invite = await db.query.invitations.findFirst({
    where: eq(invitations.token, token),
  });
  if (!invite) return fail("邀请链接无效");
  if (invite.acceptedAt) return fail("邀请已被使用");
  if (invite.expiresAt < new Date()) return fail("邀请已过期");
  const parsed = acceptValues.safeParse(values);
  if (!parsed.success) return fail("请填写显示名（50 字以内）、用户名和密码");
  values = parsed.data;
  if (values.password.length < 8) return fail("密码至少 8 位");
  if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(values.username)) {
    return fail("用户名需为 3–30 位字母、数字或 _ . -");
  }

  const email = normalizeEmail(invite.email);
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true, role: true },
  });
  if (existing) {
    return claim(() => promoteAndClaim(existing.id, invite.id), { signedIn: false });
  }

  // Signup can't join the transaction below, so it comes first: if the
  // promotion then fails, the invitation stays unclaimed and the retry
  // takes the `existing` branch above rather than dead-ending on a
  // duplicate-email signup.
  const created = await auth.api
    .signUpEmail({
      body: { email, password: values.password, name: values.name, username: values.username },
    })
    .then((r) => ({ user: r.user, error: null as unknown }))
    .catch((e: unknown) => ({ user: null, error: e }));
  if (!created.user) {
    const known = SIGN_UP_ERRORS[signUpErrorCode(created.error) ?? ""];
    return known ? fail(known) : failWith("注册失败，请稍后重试", created.error, "acceptInvite");
  }

  // A fresh account is always defaultRole "user", so it always takes the
  // invite's role — no rank comparison needed here.
  return claim(() => promoteAndClaim(created.user.id, invite.id), { signedIn: true });
}

/** Runs a claim, turning its rollback signal into an ActionResult. */
async function claim(
  run: () => Promise<unknown>,
  data: { signedIn: boolean },
): Promise<ActionResult<{ signedIn: boolean }>> {
  try {
    await run();
    return ok(data);
  } catch (error) {
    if (error instanceof ClaimFailure) return fail(error.userMessage);
    throw error;
  }
}
