"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
      setError("邮箱或密码不正确。");
      return;
    }
    const next = searchParams.get("next");
    router.push(next && next.startsWith("/") ? next : "/");
    router.refresh();
  }

  return (
    <div className="border-y border-line py-10">
      <h1 className="text-center text-2xl font-bold tracking-[0.2em]">登录</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">密码</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full tracking-[0.3em]" disabled={pending}>
          {pending ? "登录中…" : "登录"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-muted">
        还没有账号？
        <Link href="/sign-up" className="ml-1 text-brand hover:underline">
          注册
        </Link>
        <span className="mx-2">·</span>
        <Link href="/forgot-password" className="text-brand hover:underline">
          忘记密码
        </Link>
      </p>
    </div>
  );
}
