"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { type Locale, localePath } from "@/i18n/locales";
import { FormField, fieldErrors } from "./form-field";

export function ForgotPasswordForm({
  locale,
  labels,
}: {
  locale: Locale;
  labels: Dictionary["auth"];
}) {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const t = labels.forgot;

  if (sent) {
    return (
      <div className="border-line border-y py-10 text-center">
        <h1 className="font-bold text-2xl tracking-label">{t.sentTitle}</h1>
        <p role="status" className="mt-4 text-ink-muted text-sm leading-relaxed">
          {t.sentBody}
        </p>
        <Link
          href={localePath(locale, "/sign-in")}
          className="mt-6 inline-block text-brand text-sm hover:underline"
        >
          {t.backToSignIn}
        </Link>
      </div>
    );
  }

  return (
    <div className="border-line border-y py-10">
      <h1 className="text-center font-bold text-2xl tracking-label">{t.title}</h1>
      <form
        className="mt-8 space-y-5"
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          const invalid = fieldErrors(e.currentTarget, labels.errors);
          setFields(invalid);
          if (Object.keys(invalid).length) return;
          const form = new FormData(e.currentTarget);
          setPending(true);
          try {
            const { authClient } = await import("@/lib/auth-client");
            await authClient.requestPasswordReset({
              email: String(form.get("email")),
              redirectTo: localePath(locale, "/reset-password"),
            });
          } catch {
            // Swallow: reporting a failure would reveal which emails exist.
          } finally {
            setPending(false);
            // Always report success — same reason.
            setSent(true);
          }
        }}
      >
        <FormField
          id="email"
          label={t.emailLabel}
          type="email"
          required
          autoComplete="email"
          error={fields.email}
        />
        <Button type="submit" className="w-full tracking-eyebrow" disabled={pending}>
          {pending ? t.submitting : t.submit}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link href={localePath(locale, "/sign-in")} className="text-brand hover:underline">
          {t.backToSignIn}
        </Link>
      </p>
    </div>
  );
}
