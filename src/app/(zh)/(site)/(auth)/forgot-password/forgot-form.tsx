"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  if (sent) {
    return (
      <div className="border-line border-y py-10 text-center">
        <h1 className="font-bold text-2xl tracking-[0.2em]">邮件已发送</h1>
        <p className="mt-4 text-ink-muted text-sm leading-relaxed">
          如果该邮箱已注册，你会收到一封包含重置链接的邮件（1 小时内有效）。
        </p>
      </div>
    );
  }

  return (
    <div className="border-line border-y py-10">
      <h1 className="text-center font-bold text-2xl tracking-[0.2em]">找回密码</h1>
      <form
        className="mt-8 space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          setPending(true);
          await authClient.requestPasswordReset({
            email: String(form.get("email")),
            redirectTo: "/reset-password",
          });
          setPending(false);
          // Always report success — don't reveal which emails exist.
          setSent(true);
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">注册邮箱</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <Button type="submit" className="w-full tracking-[0.3em]" disabled={pending}>
          {pending ? "发送中…" : "发送重置邮件"}
        </Button>
      </form>
    </div>
  );
}
