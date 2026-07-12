import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getDict } from "@/i18n/dict";
import type { Locale } from "@/i18n/locales";
import { parseLocale } from "@/i18n/params";

const TITLE: Record<Locale, string> = { zh: "重置密码", en: "Reset password" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  return { title: TITLE[parseLocale((await params).lang)], robots: { index: false } };
}

export default async function ResetPasswordPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = parseLocale((await params).lang);
  return (
    <div className="mx-auto max-w-sm animate-fade-up px-6 pt-20">
      <Suspense>
        <ResetPasswordForm locale={locale} labels={getDict(locale).auth} />
      </Suspense>
    </div>
  );
}
