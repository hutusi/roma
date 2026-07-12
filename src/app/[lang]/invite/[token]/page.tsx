import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TitleCard } from "@/components/site/title-card";
import { db } from "@/db";
import { invitations } from "@/db/schema";
import { parseLocale } from "@/i18n/params";
import { AcceptInviteForm } from "./accept-form";

export const metadata: Metadata = {
  title: "接受邀请",
  robots: { index: false },
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ lang: string; token: string }>;
}) {
  const { lang, token } = await params;
  // Invitations come from the zh editorial team; the flow stays zh-only.
  if (parseLocale(lang) !== "zh") notFound();
  const invite = await db.query.invitations.findFirst({
    where: eq(invitations.token, token),
  });

  const problem = !invite
    ? "邀请链接无效。"
    : invite.acceptedAt
      ? "这个邀请已经被使用过了。"
      : invite.expiresAt < new Date()
        ? "邀请已过期，请联系管理员重新发送。"
        : null;

  return (
    <div className="mx-auto max-w-sm animate-fade-up px-6 pt-20">
      <TitleCard eyebrow="Invitation" title="加入编辑部" />
      {!invite || problem ? (
        <p className="mt-8 text-center text-ink-muted">{problem}</p>
      ) : (
        <>
          <p className="mt-6 text-center text-ink-muted text-sm">
            你被邀请以{invite.role === "admin" ? "管理员" : "编辑"}身份加入 八部半（{invite.email}
            ）。
          </p>
          <AcceptInviteForm token={token} />
        </>
      )}
    </div>
  );
}
