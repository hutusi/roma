"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth-client";

export function AccountForm({
  name,
  username,
  email,
}: {
  name: string;
  username: string;
  email: string;
}) {
  const router = useRouter();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  return (
    <div className="mt-10 space-y-10 pb-8">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          setSavingProfile(true);
          const newName = String(form.get("name"));
          const newUsername = String(form.get("username"));
          const { error } = await authClient.updateUser({
            name: newName,
            ...(newUsername !== username && { username: newUsername }),
          });
          setSavingProfile(false);
          if (error) {
            toast.error(error.message ?? "保存失败");
            return;
          }
          toast.success("资料已更新");
          router.refresh();
        }}
      >
        <h2 className="font-bold">基本资料</h2>
        <div className="space-y-1.5">
          <Label>邮箱（不可修改）</Label>
          <Input value={email} disabled />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">显示名</Label>
          <Input id="name" name="name" defaultValue={name} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="username">用户名（个人主页地址）</Label>
          <Input
            id="username"
            name="username"
            defaultValue={username}
            required
            pattern="[a-zA-Z0-9_.-]{3,30}"
            title="3–30 位字母、数字或 _ . -"
          />
        </div>
        <Button type="submit" disabled={savingProfile}>
          {savingProfile ? "保存中…" : "保存资料"}
        </Button>
      </form>

      <form
        className="space-y-4 border-line border-t pt-8"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const data = new FormData(form);
          setSavingPassword(true);
          const { error } = await authClient.changePassword({
            currentPassword: String(data.get("currentPassword")),
            newPassword: String(data.get("newPassword")),
            revokeOtherSessions: true,
          });
          setSavingPassword(false);
          if (error) {
            toast.error(error.message ?? "当前密码不正确");
            return;
          }
          toast.success("密码已修改，其他设备已退出登录");
          form.reset();
        }}
      >
        <h2 className="font-bold">修改密码</h2>
        <div className="space-y-1.5">
          <Label htmlFor="currentPassword">当前密码</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="newPassword">新密码</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" disabled={savingPassword}>
          {savingPassword ? "修改中…" : "修改密码"}
        </Button>
      </form>
      <Toaster position="top-center" />
    </div>
  );
}
