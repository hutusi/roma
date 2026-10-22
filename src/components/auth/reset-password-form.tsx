"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { type Locale, localePath } from "@/i18n/locales";
import { authErrorMessage } from "./auth-errors";
import { FormField, fieldErrors } from "./form-field";
import { useQueryParam } from "./use-query-param";

export function ResetPasswordForm({
  locale,
  labels,
}: {
  locale: Locale;
  labels: Dictionary["auth"];
}) {
  const router = useRouter();
  // undefined until hydration: the form renders (disabled) rather than
  // flashing the invalid-link message at everyone who has a token.
  const token = useQueryParam("token");
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const t = labels.reset;
  const reapply = (
    <Link href={localePath(locale, "/forgot-password")} className="ml-1 text-brand hover:underline">
      {t.reapplyLink}
    </Link>
  );

  if (token === null) {
    return (
      <div className="border-line border-y py-10 text-center">
        <h1 className="font-bold text-2xl tracking-label">{t.invalidTitle}</h1>
        <p className="mt-4 text-ink-muted text-sm">
          {t.invalidBody}
          {reapply}
        </p>
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
          if (!token) return;
          setError(null);
          const invalid = fieldErrors(e.currentTarget, labels.errors);
          setFields(invalid);
          if (Object.keys(invalid).length) return;
          const form = new FormData(e.currentTarget);
          setPending(true);
          try {
            const { authClient } = await import("@/lib/auth-client");
            const { error } = await authClient.resetPassword({
              newPassword: String(form.get("password")),
              token,
            });
            if (error) {
              const message = authErrorMessage(error, labels.errors);
              setExpired(message === labels.errors.tokenExpired);
              setError(message);
              return;
            }
          } catch {
            setError(labels.errors.network);
            return;
          } finally {
            setPending(false);
          }
          // Sign-in says the reset worked, so the reader knows to use the new password.
          router.push(`${localePath(locale, "/sign-in")}?reset=1`);
        }}
      >
        <FormField
          id="password"
          label={t.passwordLabel}
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          error={fields.password}
        />
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
            {expired && reapply}
          </p>
        )}
        <Button type="submit" className="w-full tracking-eyebrow" disabled={pending || !token}>
          {pending ? t.submitting : t.submit}
        </Button>
      </form>
    </div>
  );
}
