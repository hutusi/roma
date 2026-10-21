"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { isLocale, localePath } from "@/i18n/locales";

const COPY = {
  zh: {
    title: "放映中断",
    body: "出了点问题。请稍后再试，或回到首页。",
    retry: "重试",
    home: "回到首页",
    errorId: "错误编号",
  },
  en: {
    title: "Projection interrupted",
    body: "Something went wrong. Please try again, or head back to the home page.",
    retry: "Try again",
    home: "Back to the home page",
    errorId: "Error ID",
  },
} as const;

/**
 * Renders inside the [lang] layout's <main>, so it is a <div>. The
 * digest is the id Next logs the server error under: shown, a reader
 * reporting "it broke" can say which break.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams<{ lang?: string }>();
  const locale = params.lang && isLocale(params.lang) ? params.lang : "zh";
  const t = COPY[locale];
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-display text-ink-muted text-sm uppercase tracking-eyebrow">Error</p>
      <h1 className="mt-4 font-bold text-3xl tracking-label">{t.title}</h1>
      <p className="mt-4 max-w-[40ch] text-ink-muted leading-[1.9]">{t.body}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <button
          type="button"
          onClick={reset}
          className={buttonVariants({ variant: "house", size: "house" })}
        >
          {t.retry}
        </button>
        <Link
          href={localePath(locale, "/")}
          className="text-ink-muted text-sm tracking-label transition-colors hover:text-brand"
        >
          {t.home}
        </Link>
      </div>
      {error.digest && (
        <p className="mt-8 text-ink-muted text-xs">
          {t.errorId}: <code className="font-mono">{error.digest}</code>
        </p>
      )}
    </div>
  );
}
