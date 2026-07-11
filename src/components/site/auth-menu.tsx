"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import type { Locale } from "@/i18n/locales";
import { authClient } from "@/lib/auth-client";

/**
 * Header auth entry. A client island using the client-side session so
 * the header can live on fully static pages. Labels arrive as props
 * (dictionaries are server-only); user areas (/u, /me, /account,
 * /admin) are zh-only in v1, so only sign-in is locale-prefixed.
 */
export function AuthMenu({ locale, labels }: { locale: Locale; labels: Dictionary["authMenu"] }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <span className="w-10" aria-hidden />;

  if (!session) {
    return (
      <Link
        href={locale === "en" ? "/en/sign-in" : "/sign-in"}
        className="text-sm tracking-[0.2em] transition-colors hover:text-brand"
      >
        {labels.signIn}
      </Link>
    );
  }

  const role = (session.user as { role?: string }).role;
  const username = (session.user as { username?: string }).username;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-sm tracking-[0.1em] transition-colors hover:text-brand">
        {session.user.name}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="font-sans">
        {username && (
          <DropdownMenuItem asChild>
            <Link href={`/u/${username}`}>{labels.myPage}</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/me/follows">{labels.follows}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account">{labels.account}</Link>
        </DropdownMenuItem>
        {(role === "admin" || role === "editor") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin">{labels.editorial}</Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await authClient.signOut();
            router.refresh();
          }}
        >
          {labels.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
