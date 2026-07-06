"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!token) {
    return (
      <div className="border-y border-line py-10 text-center">
        <h1 className="text-2xl font-bold tracking-[0.2em]">链接无效</h1>
        <p className="mt-4 text-sm text-ink-muted">
          重置链接缺失或已过期，请
          <Link href="/forgot-password" className="mx-1 text-brand hover:underline">
            重新申请
          </Link>
          。
        </p>
      </div>
    );
  }

  return (
    <div className="border-y border-line py-10">
      <h1 className="text-center text-2xl font-bold tracking-[0.2em]">
        重置密码
      </h1>
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
            setError("重置失败：链接可能已过期，请重新申请。");
            return;
          }
          router.push("/sign-in");
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="password">新密码</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full tracking-[0.3em]" disabled={pending}>
          {pending ? "重置中…" : "重置密码"}
        </Button>
      </form>
    </div>
  );
}
