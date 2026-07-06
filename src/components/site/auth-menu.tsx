"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Header auth entry. A client island using the client-side session so
 * the header can live on fully static pages.
 */
export function AuthMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <span className="w-10" aria-hidden />;

  if (!session) {
    return (
      <Link
        href="/sign-in"
        className="text-sm tracking-[0.2em] transition-colors hover:text-brand"
      >
        登录
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
            <Link href={`/u/${username}`}>我的主页</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/me/follows">关注的片单</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account">账号设置</Link>
        </DropdownMenuItem>
        {(role === "admin" || role === "editor") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin">编辑部</Link>
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
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
