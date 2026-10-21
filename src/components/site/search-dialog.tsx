"use client";

import { SearchIcon } from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import type { Locale } from "@/i18n/locales";

const loadPanel = () => import("./search-panel");
const SearchPanel = lazy(() => loadPanel().then((m) => ({ default: m.SearchPanel })));

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable
  );
}

/**
 * Header search: just the trigger and the keyboard shortcuts. The
 * overlay (Radix Dialog, matcher, results) is SearchPanel, fetched on
 * first intent — hover or focus warms it, a click or ⌘K opens it — so
 * it stays out of the layout chunk every page loads. Labels arrive as
 * props from the server header.
 */
export function SearchDialog({ locale, labels }: { locale: Locale; labels: Dictionary["search"] }) {
  const [open, setOpen] = useState(false);
  // Mounted once opened, then kept, so reopening is instant.
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const show = () => {
    setMounted(true);
    setOpen(true);
  };

  // ⌘K / Ctrl+K anywhere; "/" when not typing. The admin tree has its
  // own root layout without this header, so no conflict with its forms.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const cmdK = event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
      const slash = event.key === "/" && !isTypingTarget(event.target);
      if (cmdK || slash) {
        event.preventDefault();
        setMounted(true);
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="self-center text-ink transition-colors hover:text-brand"
        aria-label={labels.open}
        aria-haspopup="dialog"
        aria-expanded={open}
        onPointerEnter={() => void loadPanel()}
        onFocus={() => void loadPanel()}
        onClick={show}
      >
        <SearchIcon className="h-4 w-4" aria-hidden />
      </button>
      {mounted && (
        <Suspense fallback={null}>
          <SearchPanel
            locale={locale}
            labels={labels}
            open={open}
            onClose={() => setOpen(false)}
            triggerRef={triggerRef}
          />
        </Suspense>
      )}
    </>
  );
}
