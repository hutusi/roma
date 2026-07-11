"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="mt-1 w-full rounded px-2 py-1.5 text-left text-ink-muted transition-colors hover:bg-accent hover:text-brand"
      onClick={async () => {
        await authClient.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      退出登录
    </button>
  );
}
