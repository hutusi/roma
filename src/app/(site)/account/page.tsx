import type { Metadata } from "next";
import { TitleCard } from "@/components/site/title-card";
import { requireUser } from "@/lib/auth-guards";
import { AccountForm } from "./account-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "账号设置",
  robots: { index: false },
};

export default async function AccountPage() {
  const session = await requireUser();
  return (
    <div className="mx-auto max-w-md animate-fade-up px-6 pt-16">
      <TitleCard eyebrow="Account" title="账号设置" />
      <AccountForm
        name={session.user.name}
        username={(session.user as { username?: string | null }).username ?? ""}
        email={session.user.email}
      />
    </div>
  );
}
