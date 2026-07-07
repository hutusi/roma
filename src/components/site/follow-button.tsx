"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { setFollow } from "@/actions/follows";
import { cn } from "@/lib/utils";

/** Client island on the (SSG-cached) list page — fetches its own state. */
export function FollowButton({ listId }: { listId: string }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [following, setFollowing] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/me/state?listId=${listId}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setSignedIn(data.signedIn);
        setFollowing(data.following);
      })
      .catch(() => setSignedIn(false));
    return () => {
      cancelled = true;
    };
  }, [listId]);

  if (signedIn === null) return <div className="h-9 w-28" aria-hidden />;

  if (!signedIn) {
    return (
      <Link
        href="/sign-in"
        className="text-sm tracking-[0.2em] text-ink-muted transition-colors hover:text-brand"
      >
        登录后可关注片单
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      className={cn(
        "border px-6 py-2 text-sm tracking-[0.25em] transition-colors",
        following
          ? "border-brand bg-brand text-paper"
          : "border-line text-ink-muted hover:border-brand hover:text-brand",
      )}
      onClick={() => {
        const next = !following;
        setFollowing(next);
        startTransition(async () => {
          const result = await setFollow(listId, next);
          if (!result.ok) setFollowing(!next);
        });
      }}
    >
      {following ? "已关注" : "关注片单"}
    </button>
  );
}
