import type { Metadata } from "next";
import { AccountPage } from "@/components/user/account-page";
import type { Locale } from "@/i18n/locales";
import { parseLocale } from "@/i18n/params";

export const dynamic = "force-dynamic";

const TITLE: Record<Locale, string> = { zh: "账号设置", en: "Account settings" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  return { title: TITLE[parseLocale((await params).lang)], robots: { index: false } };
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  return <AccountPage locale={parseLocale((await params).lang)} />;
}
