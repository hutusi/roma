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

export function SignUpForm({ locale, labels }: { locale: Locale; labels: Dictionary["auth"] }) {
  const router = useRouter();
  const next = useQueryParam("next");
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const t = labels.signUp;
  const signInHref = next
    ? `${localePath(locale, "/sign-in")}?next=${encodeURIComponent(next)}`
    : localePath(locale, "/sign-in");

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
      const { error } = await authClient.signUp.email({
        email: String(form.get("email")),
        password: String(form.get("password")),
        name: String(form.get("name")),
        username: String(form.get("username")),
        // The edition someone signs up from seeds their language
        // preference (editable later in account settings).
        locale,
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
    invalidateMe();
    router.push(safeNextPath(next, localePath(locale, "/")));
    router.refresh();
  }

  return (
    <div className="border-line border-y py-10">
      <h1 className="text-center font-bold text-2xl tracking-label">{t.title}</h1>
      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <FormField id="name" label={t.name} required autoComplete="name" error={fields.name} />
        <FormField
          id="username"
          label={t.username}
          required
          autoComplete="username"
          pattern="[a-zA-Z0-9_.\-]{3,30}"
          hint={t.usernameHint}
          error={fields.username}
        />
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
          minLength={8}
          autoComplete="new-password"
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
        {t.hasAccount}
        <Link href={signInHref} className="ml-1 text-brand hover:underline">
          {t.signInLink}
        </Link>
      </p>
    </div>
  );
}
