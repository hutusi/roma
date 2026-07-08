"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { setMark } from "@/actions/marks";
import { cn } from "@/lib/utils";

type MarkStatus = "watched" | "want" | null;

/**
 * Client island on the (SSG-cached) film page: fetches its own state so
 * cached HTML stays user-free.
 */
export function MarkButtons({ filmId }: { filmId: string }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [mark, setMarkState] = useState<MarkStatus>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/me/state?filmId=${filmId}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setSignedIn(data.signedIn);
        setMarkState(data.mark);
      })
      .catch(() => setSignedIn(false));
    return () => {
      cancelled = true;
    };
  }, [filmId]);

  if (signedIn === null) {
    return <div className="h-9 w-44" aria-hidden />;
  }

  if (!signedIn) {
    return (
      <Link
        href="/sign-in"
        className="text-ink-muted text-sm tracking-[0.2em] transition-colors hover:text-brand"
      >
        登录后可标记「看过 / 想看」
      </Link>
    );
  }

  const toggle = (status: Exclude<MarkStatus, null>) => {
    const next = mark === status ? null : status;
    const prev = mark;
    setMarkState(next);
    startTransition(async () => {
      const result = await setMark(filmId, next);
      if (!result.ok) setMarkState(prev);
    });
  };

  const buttonClass = (active: boolean) =>
    cn(
      "border px-5 py-2 text-sm tracking-[0.25em] transition-colors",
      active
        ? "border-brand bg-brand text-paper"
        : "border-line text-ink-muted hover:border-brand hover:text-brand",
    );

  return (
    <div className="flex gap-3">
      <button
        type="button"
        disabled={pending}
        className={buttonClass(mark === "watched")}
        onClick={() => toggle("watched")}
      >
        看过
      </button>
      <button
        type="button"
        disabled={pending}
        className={buttonClass(mark === "want")}
        onClick={() => toggle("want")}
      >
        想看
      </button>
    </div>
  );
}
