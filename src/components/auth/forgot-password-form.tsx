"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { type Locale, localePath } from "@/i18n/locales";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm({
  locale,
  labels,
}: {
  locale: Locale;
  labels: Dictionary["auth"];
}) {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const t = labels.forgot;

  if (sent) {
    return (
      <div className="border-line border-y py-10 text-center">
        <h1 className="font-bold text-2xl tracking-[0.2em]">{t.sentTitle}</h1>
        <p className="mt-4 text-ink-muted text-sm leading-relaxed">{t.sentBody}</p>
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
          setPending(true);
          await authClient.requestPasswordReset({
            email: String(form.get("email")),
            redirectTo: localePath(locale, "/reset-password"),
          });
          setPending(false);
          // Always report success — don't reveal which emails exist.
          setSent(true);
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">{t.emailLabel}</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <Button type="submit" className="w-full tracking-[0.3em]" disabled={pending}>
          {pending ? t.submitting : t.submit}
        </Button>
      </form>
    </div>
  );
}
