"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { invalidateMe } from "@/components/site/use-me";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { type Locale, localePath } from "@/i18n/locales";
import { safeNextPath } from "@/lib/safe-next";
import { authErrorMessage } from "./auth-errors";
import { FormField, fieldErrors } from "./form-field";
import { useQueryParam } from "./use-query-param";

export function SignInForm({ locale, labels }: { locale: Locale; labels: Dictionary["auth"] }) {
  const router = useRouter();
  const next = useQueryParam("next");
  const justReset = useQueryParam("reset") === "1";
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const t = labels.signIn;
  // Sign-up keeps the destination, so a new reader also lands back where they were.
  const signUpHref = next
    ? `${localePath(locale, "/sign-up")}?next=${encodeURIComponent(next)}`
    : localePath(locale, "/sign-up");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const invalid = fieldErrors(event.currentTarget, labels.errors);
    setFields(invalid);
    if (Object.keys(invalid).length) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    try {
      const { authClient } = await import("@/lib/auth-client");
      const { error } = await authClient.signIn.email({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      if (error) {
        setError(authErrorMessage(error, labels.errors));
        return;
      }
    } catch {
      setError(labels.errors.network);
      return;
    } finally {
      setPending(false);
    }
    // The header and islands read the session from a shared store.
    invalidateMe();
    router.push(safeNextPath(next, localePath(locale, "/")));
    router.refresh();
  }

  return (
    <div className="border-line border-y py-10">
      <h1 className="text-center font-bold text-2xl tracking-label">{t.title}</h1>
      {justReset && (
        <p role="status" className="mt-6 border border-line bg-card px-4 py-3 text-center text-sm">
          {t.resetDone}
        </p>
      )}
      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <FormField
          id="email"
          label={labels.email}
          type="email"
          required
          autoComplete="email"
          error={fields.email}
        />
        <FormField
          id="password"
          label={labels.password}
          type="password"
          required
          autoComplete="current-password"
          error={fields.password}
        />
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full tracking-eyebrow" disabled={pending}>
          {pending ? t.submitting : t.submit}
        </Button>
      </form>
      <p className="mt-6 text-center text-ink-muted text-sm">
        {t.noAccount}
        <Link href={signUpHref} className="ml-1 text-brand hover:underline">
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
