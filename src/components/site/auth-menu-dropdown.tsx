"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { notifyError } from "@/components/site/notify";
import { invalidateMe, type MeUser } from "@/components/site/use-me";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { type Locale, localePath } from "@/i18n/locales";

/**
 * The signed-in half of AuthMenu, split out so its Radix menu loads only
 * for signed-in readers. User areas (/u, /me, /account) are localized,
 * so their links follow the current locale; /admin stays zh (the admin
 * is zh-only).
 */
export function AuthMenuDropdown({
  locale,
  labels,
  user,
}: {
  locale: Locale;
  labels: Dictionary["authMenu"];
  user: MeUser;
}) {
  const router = useRouter();

  const signOut = async () => {
    try {
      // The better-auth client is only needed here; keep it out of the
      // layout chunk every page loads.
      const { authClient } = await import("@/lib/auth-client");
      const { error } = await authClient.signOut();
      if (error) throw error;
    } catch {
      notifyError(labels.signOutFailed);
      return;
    }
    invalidateMe();
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="max-w-[10rem] truncate text-sm tracking-title transition-colors hover:text-brand">
        {user.name}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="font-sans">
        {user.username && (
          <DropdownMenuItem asChild>
            <Link href={localePath(locale, `/u/${user.username}`)}>{labels.myPage}</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={localePath(locale, "/me/follows")}>{labels.follows}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={localePath(locale, "/account")}>{labels.account}</Link>
        </DropdownMenuItem>
        {(user.role === "admin" || user.role === "editor") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin">{labels.editorial}</Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>{labels.signOut}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
