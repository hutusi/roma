"use client";

import Link from "next/link";
import { useTransition } from "react";
import { setFollow } from "@/actions/follows";
import { notifyError } from "@/components/site/notify";
import { invalidateMe, setMeFollow, useMe } from "@/components/site/use-me";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { cn } from "@/lib/utils";

/**
 * Client island on the (SSG-cached) list page — reads the follow through
 * the shared useMe store. Labels arrive as props (dictionaries are
 * server-only).
 */
export function FollowButton({
  listId,
  labels,
  signInHref,
}: {
  listId: string;
  labels: Dictionary["followButton"];
  /** Locale-prefixed sign-in URL — pages pass localePath(locale, "/sign-in"). */
  signInHref: string;
}) {
  const { status, user, following, retry } = useMe({ listId });
  const [pending, startTransition] = useTransition();

  if (status === "loading") return <div className="h-9 w-28" aria-hidden />;

  // Unknown is not signed out (see MarkButtons).
  if (status === "error") {
    return (
      <button
        type="button"
        onClick={retry}
        className="text-ink-muted text-sm tracking-title transition-colors hover:text-brand"
      >
        {labels.unavailable}
      </button>
    );
  }

  if (!user) {
    return (
      <Link
        href={signInHref}
        className="text-ink-muted text-sm tracking-label transition-colors hover:text-brand"
      >
        {labels.signInPrompt}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={following}
      disabled={pending}
      className={cn(
        "border px-6 py-2 text-sm tracking-label transition-colors disabled:cursor-wait disabled:opacity-60",
        following
          ? "border-brand bg-brand text-paper"
          : "border-line text-ink-muted hover:border-brand hover:text-brand",
      )}
      onClick={() => {
        const next = !following;
        setMeFollow(listId, next);
        startTransition(async () => {
          const result = await setFollow(listId, next).catch(() => null);
          if (!result?.ok) {
            setMeFollow(listId, !next);
            if (result?.error === "sessionExpired") invalidateMe();
            else notifyError(labels.failed);
          }
        });
      }}
    >
      {following ? labels.following : labels.follow}
    </button>
  );
}
