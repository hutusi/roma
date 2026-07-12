import type { Metadata } from "next";
import { UserListPage } from "@/components/user/user-list-page";
import { parseLocale } from "@/i18n/params";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { robots: { index: false } };
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; username: string; id: string }>;
}) {
  const { lang, username, id } = await params;
  return <UserListPage username={username} id={id} locale={parseLocale(lang)} />;
}
