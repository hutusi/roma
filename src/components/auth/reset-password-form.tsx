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

export function ResetPasswordForm({
  locale,
  labels,
}: {
  locale: Locale;
  labels: Dictionary["auth"];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const t = labels.reset;

  if (!token) {
    return (
      <div className="border-line border-y py-10 text-center">
        <h1 className="font-bold text-2xl tracking-[0.2em]">{t.invalidTitle}</h1>
        <p className="mt-4 text-ink-muted text-sm">
          {t.invalidBody}
          <Link
            href={localePath(locale, "/forgot-password")}
            className="ml-1 text-brand hover:underline"
          >
            {t.reapplyLink}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="border-line border-y py-10">
      <h1 className="text-center font-bold text-2xl tracking-[0.2em]">{t.title}</h1>
      <form
        className="mt-8 space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          setError(null);
          setPending(true);
          const { error } = await authClient.resetPassword({
            newPassword: String(form.get("password")),
            token,
          });
          setPending(false);
          if (error) {
            setError(t.error);
            return;
          }
          router.push(localePath(locale, "/sign-in"));
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="password">{t.passwordLabel}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button type="submit" className="w-full tracking-[0.3em]" disabled={pending}>
          {pending ? t.submitting : t.submit}
        </Button>
      </form>
    </div>
  );
}
