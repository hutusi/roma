"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
      setError(error.message ?? "注册失败，请稍后再试。");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="border-line border-y py-10">
      <h1 className="text-center font-bold text-2xl tracking-[0.2em]">注册</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">显示名</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">用户名</Label>
          <Input
            id="username"
            name="username"
            required
            autoComplete="username"
            pattern="[a-zA-Z0-9_.-]{3,30}"
            title="3–30 位字母、数字或 _ . -（用于个人主页地址）"
          />
        </div>
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
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button type="submit" className="w-full tracking-[0.3em]" disabled={pending}>
          {pending ? "注册中…" : "注册"}
        </Button>
      </form>
      <p className="mt-6 text-center text-ink-muted text-sm">
        已有账号？
        <Link href="/sign-in" className="ml-1 text-brand hover:underline">
          登录
        </Link>
      </p>
    </div>
  );
}
