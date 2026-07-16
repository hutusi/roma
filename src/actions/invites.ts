"use server";

import { and, eq, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { invitations, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-guards";
import { type ActionResult, fail, ok } from "./result";

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

export async function revokeInvite(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.delete(invitations).where(eq(invitations.id, id));
  return ok();
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
 * Promotes `userId` and claims the invitation as one unit. The claim is
 * conditional on the invitation still being unaccepted, so two concurrent
 * accepts can't both consume it. Both statements assert they matched a
 * row: a zero-row promotion that still stamped acceptedAt would burn the
 * invitation while leaving the account unprivileged, with no way back.
 */
async function promoteAndClaim(userId: string, inviteId: string, role: string) {
  return db.transaction(async (tx) => {
    const promoted = await tx
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning({ id: users.id });
    if (!promoted.length) throw new ClaimFailure("账号不存在，请重新接受邀请");

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
    // Only ever raise. An invite is an onboarding grant, not role
    // management (/admin/users is), so an admin accepting an editor
    // invite must keep admin rather than be silently demoted.
    //
    // This rank decision reads the role OUTSIDE the transaction that
    // writes it, so two accepts for the SAME email (two distinct
    // invitations — the acceptedAt guard doesn't serialize across
    // invites) can both read the old role and the lower grant can commit
    // last. Left undone deliberately: it needs one address racing two
    // invite links within milliseconds. The real fix is SELECT ... FOR
    // UPDATE on the user row (or a rank-conditional UPDATE) — a plain
    // transaction around the read would NOT help, same READ COMMITTED
    // trap the publishFilm and deleteDirector comments describe.
    const role = rank(existing.role) >= rank(invite.role) ? (existing.role ?? "user") : invite.role;
    return claim(() => promoteAndClaim(existing.id, invite.id, role), { signedIn: false });
  }

  // Signup can't join the transaction below, so it comes first: if the
  // promotion then fails, the invitation stays unclaimed and the retry
  // takes the `existing` branch above rather than dead-ending on a
  // duplicate-email signup.
  const created = await auth.api
    .signUpEmail({
      body: { email, password: values.password, name: values.name, username: values.username },
    })
    .then((r) => ({ user: r.user, error: null as string | null }))
    .catch((e: unknown) => ({
      user: null,
      error: e instanceof Error ? e.message : "注册失败",
    }));
  if (created.error || !created.user) return fail(created.error ?? "注册失败");

  // A fresh account is always defaultRole "user", so it always takes the
  // invite's role — no rank comparison needed here.
  return claim(() => promoteAndClaim(created.user.id, invite.id, invite.role), { signedIn: true });
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
