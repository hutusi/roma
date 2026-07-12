"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { isLocale, type Locale, localePath } from "@/i18n/locales";
import { authClient } from "@/lib/auth-client";

export function AccountForm({
  name,
  username,
  email,
  locale,
  storedLocale,
  labels,
}: {
  name: string;
  username: string;
  email: string;
  /** Locale of the page being viewed. */
  locale: Locale;
  /** The user's saved preference; null until they (or sign-up) set one. */
  storedLocale: Locale | null;
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
          const rawLocale = String(form.get("locale"));
          const newLocale = isLocale(rawLocale) ? rawLocale : locale;
          const { error } = await authClient.updateUser({
            name: newName,
            locale: newLocale,
            ...(newUsername !== username && { username: newUsername }),
          });
          setSavingProfile(false);
          if (error) {
            toast.error(error.message ?? labels.saveFailed);
            return;
          }
          toast.success(labels.profileSaved);
          // Choosing the other language moves the reader there right away.
          if (newLocale !== locale) {
            router.push(localePath(newLocale, "/account"));
            return;
          }
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
        <div className="space-y-1.5">
          <Label htmlFor="locale">{labels.language}</Label>
          {/* Two invariant options — the unused radix select would be
              overkill. Option labels are in their own language. */}
          <select
            id="locale"
            name="locale"
            defaultValue={storedLocale ?? locale}
            title={labels.languageHint}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring"
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
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
