"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { type Locale, localePath } from "@/i18n/locales";
import { authClient } from "@/lib/auth-client";

export function SignInForm({ locale, labels }: { locale: Locale; labels: Dictionary["auth"] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const t = labels.signIn;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    const { error } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setPending(false);
    if (error) {
      setError(t.error);
      return;
    }
    const next = searchParams.get("next");
    // Same-origin paths only: "//evil.com" passes startsWith("/") but
    // navigates cross-origin (open redirect).
    router.push(next?.startsWith("/") && !next.startsWith("//") ? next : localePath(locale, "/"));
    router.refresh();
  }

  return (
    <div className="border-line border-y py-10">
      <h1 className="text-center font-bold text-2xl tracking-[0.2em]">{t.title}</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">{labels.email}</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{labels.password}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button type="submit" className="w-full tracking-[0.3em]" disabled={pending}>
          {pending ? t.submitting : t.submit}
        </Button>
      </form>
      <p className="mt-6 text-center text-ink-muted text-sm">
        {t.noAccount}
        <Link href={localePath(locale, "/sign-up")} className="ml-1 text-brand hover:underline">
          {t.signUpLink}
        </Link>
        <span className="mx-2">·</span>
        <Link href={localePath(locale, "/forgot-password")} className="text-brand hover:underline">
          {t.forgotLink}
        </Link>
      </p>
    </div>
  );
}
