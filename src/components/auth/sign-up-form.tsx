"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { type Locale, localePath } from "@/i18n/locales";
import { authClient } from "@/lib/auth-client";

export function SignUpForm({ locale, labels }: { locale: Locale; labels: Dictionary["auth"] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const t = labels.signUp;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    const { error } = await authClient.signUp.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
      name: String(form.get("name")),
      username: String(form.get("username")),
    });
    setPending(false);
    if (error) {
      setError(error.message ?? t.fallbackError);
      return;
    }
    router.push(localePath(locale, "/"));
    router.refresh();
  }

  return (
    <div className="border-line border-y py-10">
      <h1 className="text-center font-bold text-2xl tracking-[0.2em]">{t.title}</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">{t.name}</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">{t.username}</Label>
          <Input
            id="username"
            name="username"
            required
            autoComplete="username"
            pattern="[a-zA-Z0-9_.-]{3,30}"
            title={t.usernameHint}
          />
        </div>
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
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button type="submit" className="w-full tracking-[0.3em]" disabled={pending}>
          {pending ? t.submitting : t.submit}
        </Button>
      </form>
      <p className="mt-6 text-center text-ink-muted text-sm">
        {t.hasAccount}
        <Link href={localePath(locale, "/sign-in")} className="ml-1 text-brand hover:underline">
          {t.signInLink}
        </Link>
      </p>
    </div>
  );
}
