"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { acceptInvite } from "@/actions/invites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { localePath } from "@/i18n/locales";

export function AcceptInviteForm({ token }: { token: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await acceptInvite(token, {
        name: String(form.get("name")),
        username: String(form.get("username")),
        password: String(form.get("password")),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Only signup establishes a session. When the address already had
      // an account the role is granted but no session exists, so /admin
      // would just bounce to sign-in — say so instead of pretending.
      if (result.data.signedIn) {
        toast.success("欢迎加入编辑部");
        router.push("/admin");
        // Signup set a session cookie; refresh so server components
        // re-render with it. Only meaningful on this branch — refreshing
        // the other one just re-renders this page (now "already used")
        // and races the push, which can strand the user here.
        router.refresh();
      } else {
        toast.success("该邮箱已有账号，权限已授予", {
          description: "请用原有密码登录。",
          duration: 8000,
        });
        router.push(localePath("zh", "/sign-in"));
      }
    } catch {
      setError("出了点问题，请稍后再试。");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">显示名</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">用户名</Label>
        <Input
          id="username"
          name="username"
          required
          pattern="[a-zA-Z0-9_.-]{3,30}"
          title="3–30 位字母、数字或 _ . -"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">设置密码</Label>
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
        {pending ? "创建账号中…" : "接受邀请"}
      </Button>
      <Toaster position="top-center" />
    </form>
  );
}
