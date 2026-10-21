"use client";

import Link from "next/link";
import { useTransition } from "react";
import { setMark } from "@/actions/marks";
import { notifyError } from "@/components/site/notify";
import { invalidateMe, type MarkStatus, setMeMark, useMe } from "@/components/site/use-me";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { cn } from "@/lib/utils";

/**
 * Client island on the (SSG-cached) film page. Reads the reader's mark
 * through the shared useMe store so cached HTML stays user-free. Labels
 * arrive as props — dictionaries are server-only.
 */
export function MarkButtons({
  filmId,
  labels,
  signInHref,
}: {
  filmId: string;
  labels: Dictionary["markButtons"];
  /** Locale-prefixed sign-in URL — pages pass localePath(locale, "/sign-in"). */
  signInHref: string;
}) {
  const { status, user, mark, retry } = useMe({ filmId });
  const [pending, startTransition] = useTransition();

  if (status === "loading") return <div className="h-9 w-44" aria-hidden />;

  // Unknown is not signed out: a failed read must not tell a signed-in
  // reader to sign in.
  if (status === "error") {
    return (
      <button
        type="button"
        onClick={retry}
        className="text-ink-muted text-sm tracking-[0.1em] transition-colors hover:text-brand"
      >
        {labels.unavailable}
      </button>
    );
  }

  if (!user) {
    return (
      <Link
        href={signInHref}
        className="text-ink-muted text-sm tracking-[0.2em] transition-colors hover:text-brand"
      >
        {labels.signInPrompt}
      </Link>
    );
  }

  const toggle = (status: MarkStatus) => {
    const next = mark === status ? null : status;
    const prev = mark;
    setMeMark(filmId, next);
    startTransition(async () => {
      const result = await setMark(filmId, next).catch(() => null);
      if (!result?.ok) {
        setMeMark(filmId, prev);
        // An expired session re-reads the store, which swaps these
        // buttons for the sign-in prompt — that is the feedback.
        if (result?.error === "sessionExpired") invalidateMe();
        else notifyError(labels.failed);
      }
    });
  };

  const buttonClass = (active: boolean) =>
    cn(
      "border px-5 py-2 text-sm tracking-[0.25em] transition-colors disabled:cursor-wait disabled:opacity-60",
      active
        ? "border-brand bg-brand text-paper"
        : "border-line text-ink-muted hover:border-brand hover:text-brand",
    );

  return (
    <div className="flex gap-3">
      <button
        type="button"
        aria-pressed={mark === "watched"}
        disabled={pending}
        className={buttonClass(mark === "watched")}
        onClick={() => toggle("watched")}
      >
        {labels.watched}
      </button>
      <button
        type="button"
        aria-pressed={mark === "want"}
        disabled={pending}
        className={buttonClass(mark === "want")}
        onClick={() => toggle("want")}
      >
        {labels.want}
      </button>
    </div>
  );
}
