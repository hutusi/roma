import type { Metadata } from "next";
import { FollowsPage } from "@/components/user/follows-page";
import type { Locale } from "@/i18n/locales";
import { parseLocale } from "@/i18n/params";

export const dynamic = "force-dynamic";

const TITLE: Record<Locale, string> = { zh: "关注的片单", en: "Followed lists" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  return { title: TITLE[parseLocale((await params).lang)], robots: { index: false } };
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  return <FollowsPage locale={parseLocale((await params).lang)} />;
}
