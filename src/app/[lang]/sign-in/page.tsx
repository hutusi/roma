import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getDict } from "@/i18n/dict";
import type { Locale } from "@/i18n/locales";
import { parseLocale } from "@/i18n/params";

const TITLE: Record<Locale, string> = { zh: "登录", en: "Sign in" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  return { title: TITLE[parseLocale((await params).lang)] };
}

export default async function SignInPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = parseLocale((await params).lang);
  return (
    <div className="mx-auto max-w-sm animate-fade-up px-6 pt-20">
      <Suspense>
        <SignInForm locale={locale} labels={getDict(locale).auth} />
      </Suspense>
    </div>
  );
}
