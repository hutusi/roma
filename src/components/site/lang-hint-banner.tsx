"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { counterpartPath, isLocale, type Locale } from "@/i18n/locales";
import { authClient } from "@/lib/auth-client";

const DISMISS_KEY = "babuban.langHintDismissed";

/**
 * One-time hint for readers whose browser language doesn't match the
 * edition they landed on: a fixed pill linking to the same page in the
 * other locale. Never a redirect (ADR 0012 keeps locale choice
 * explicit). Visibility is computed strictly after mount — navigator
 * and localStorage must not be read during render (hydration) — and a
 * signed-in reader whose stored preference matches the current edition
 * is never nagged. Copy is written in the TARGET language so the
 * mismatched reader can actually read it.
 */
export function LangHintBanner({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [dismissed, setDismissed] = useState(true);
  const [browserPrefersOther, setBrowserPrefersOther] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    const primary = (navigator.languages?.[0] ?? navigator.language ?? "").toLowerCase();
    const other = locale === "zh" ? "en" : "zh";
    setBrowserPrefersOther(primary.startsWith(other));
  }, [locale]);

  if (dismissed || !browserPrefersOther || isPending) return null;

  // A stored preference equal to the current edition wins over the
  // browser language — the reader already chose this language.
  const stored = (session?.user as { locale?: string | null } | undefined)?.locale;
  if (stored != null && isLocale(stored) && stored === locale) return null;

  const counterpart = counterpartPath(pathname);
  if (!counterpart) return null;

  const en = counterpart.target === "en";
  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 border border-line bg-paper px-4 py-2 text-sm shadow-md">
      <span className="text-ink-muted">
        {en ? "This page is available in English." : "本页有中文版。"}
      </span>
      <Link href={counterpart.href} className="text-brand hover:underline">
        {en ? "Read in English" : "阅读中文版"}
      </Link>
      <button
        type="button"
        aria-label={en ? "Dismiss" : "关闭"}
        className="ml-1 text-ink-muted transition-colors hover:text-brand"
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, "1");
          setDismissed(true);
        }}
      >
        ×
      </button>
    </div>
  );
}
