"use client";

// Last-resort boundary: only fires when a *root layout* itself throws, so
// it must render its own <html>/<body> (it replaces the root layout).
// The layout that would resolve the locale is what failed, so it reads
// the edition from the URL itself; the admin and anything unrecognized
// get zh. Ordinary route errors are handled by [lang]/error.tsx and
// admin/error.tsx.
import "@/assets/fonts/babuban-serif-sc.css";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/source-serif-4/400.css";
import "./globals.css";
import { usePathname } from "next/navigation";
import { HOUSE_BUTTON } from "@/components/site/house-button";

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

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname() ?? "";
  const locale = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "zh";
  const t = COPY[locale];
  return (
    <html lang={locale === "en" ? "en" : "zh-CN"} className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <main className="flex min-h-screen flex-1 flex-col items-center justify-center px-6 py-24 text-center">
          <p className="font-display text-ink-muted text-sm uppercase tracking-eyebrow">Error</p>
          <h1 className="mt-4 font-bold text-3xl tracking-label">{t.title}</h1>
          <p className="mt-4 max-w-[42ch] text-ink-muted leading-[1.9]">{t.body}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <button type="button" onClick={reset} className={HOUSE_BUTTON}>
              {t.retry}
            </button>
            {/* A plain anchor: the router itself may be what broke. */}
            <a
              href={locale === "en" ? "/en" : "/zh"}
              className="text-ink-muted text-sm tracking-label hover:text-brand"
            >
              {t.home}
            </a>
          </div>
          {error.digest && (
            <p className="mt-8 text-ink-muted text-xs">
              {t.errorId}: <code className="font-mono">{error.digest}</code>
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
