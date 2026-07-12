import type { Metadata } from "next";
import { ProfilePage } from "@/components/user/profile-page";
import { parseLocale } from "@/i18n/params";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}`, robots: { index: false } };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; username: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { lang, username } = await params;
  const { tab } = await searchParams;
  return <ProfilePage username={username} tab={tab} locale={parseLocale(lang)} />;
}
