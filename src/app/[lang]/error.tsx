"use client";

import { useParams } from "next/navigation";
import { isLocale } from "@/i18n/locales";

const COPY = {
  zh: {
    title: "放映中断",
    body: "出了点问题。请稍后再试，或回到首页。",
    retry: "重试",
  },
  en: {
    title: "Projection interrupted",
    body: "Something went wrong. Please try again, or head back to the home page.",
    retry: "Try again",
  },
} as const;

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  const params = useParams<{ lang?: string }>();
  const t = COPY[params.lang && isLocale(params.lang) ? params.lang : "zh"];
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-display text-ink-muted text-sm uppercase tracking-[0.4em]">Error</p>
      <h1 className="mt-4 font-bold text-3xl tracking-[0.2em]">{t.title}</h1>
      <p className="mt-4 max-w-[40ch] text-ink-muted leading-[1.9]">{t.body}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 border border-ink px-8 py-3 text-sm tracking-[0.3em] transition-colors hover:border-brand hover:text-brand"
      >
        {t.retry}
      </button>
    </main>
  );
}
