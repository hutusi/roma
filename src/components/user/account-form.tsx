"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { authClient } from "@/lib/auth-client";

export function AccountForm({
  name,
  username,
  email,
  labels,
}: {
  name: string;
  username: string;
  email: string;
  labels: Dictionary["account"];
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
            toast.error(error.message ?? labels.saveFailed);
            return;
          }
          toast.success(labels.profileSaved);
          router.refresh();
        }}
      >
        <h2 className="font-bold">{labels.basicInfo}</h2>
        <div className="space-y-1.5">
          <Label>{labels.emailLabel}</Label>
          <Input value={email} disabled />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">{labels.displayName}</Label>
          <Input id="name" name="name" defaultValue={name} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="username">{labels.usernameLabel}</Label>
          <Input
            id="username"
            name="username"
            defaultValue={username}
            required
            pattern="[a-zA-Z0-9_.-]{3,30}"
            title={labels.usernameTitle}
          />
        </div>
        <Button type="submit" disabled={savingProfile}>
          {savingProfile ? labels.savingProfile : labels.saveProfile}
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
            toast.error(error.message ?? labels.wrongPassword);
            return;
          }
          toast.success(labels.passwordChanged);
          form.reset();
        }}
      >
        <h2 className="font-bold">{labels.changePassword}</h2>
        <div className="space-y-1.5">
          <Label htmlFor="currentPassword">{labels.currentPassword}</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="newPassword">{labels.newPassword}</Label>
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
          {savingPassword ? labels.savingPassword : labels.changePassword}
        </Button>
      </form>
      <Toaster position="top-center" />
    </div>
  );
}
