"use client";

import { SearchIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { type Locale, localePath } from "@/i18n/locales";
import type { SearchPanel as SearchPanelType } from "./search-panel";

type Panel = typeof SearchPanelType;

// Not React.lazy: a lazy() that rejects stays rejected and rethrows on
// every render, taking the page down to the route error boundary, which
// is what a long-open tab got after a deploy replaced the chunk. A failed
// load is forgotten here, so the next intent retries it.
let panelLoad: Promise<Panel> | null = null;
function loadPanel(): Promise<Panel> {
  panelLoad ??= import("./search-panel").then(
    (m) => m.SearchPanel,
    (error) => {
      panelLoad = null;
      throw error;
    },
  );
  return panelLoad;
}
const warmPanel = () => {
  loadPanel().catch(() => {});
};

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
  // Set once loaded, then kept, so reopening is instant.
  const [Panel, setPanel] = useState<Panel | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // If the panel can't load (offline, or a deploy retired its chunk), the
  // full search page still works: go there rather than do nothing.
  const show = useCallback(() => {
    setOpen(true);
    loadPanel().then(
      (loaded) => setPanel(() => loaded),
      () => window.location.assign(localePath(locale, "/search")),
    );
  }, [locale]);

  // ⌘K / Ctrl+K anywhere; "/" when not typing. The admin tree has its
  // own root layout without this header, so no conflict with its forms.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const cmdK = event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
      const slash = event.key === "/" && !isTypingTarget(event.target);
      if (cmdK || slash) {
        event.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [show]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="self-center text-ink transition-colors hover:text-brand"
        aria-label={labels.open}
        aria-haspopup="dialog"
        aria-expanded={open}
        onPointerEnter={warmPanel}
        onFocus={warmPanel}
        onClick={show}
      >
        <SearchIcon className="h-4 w-4" aria-hidden />
      </button>
      {Panel && (
        <Panel
          locale={locale}
          labels={labels}
          open={open}
          onClose={() => setOpen(false)}
          triggerRef={triggerRef}
        />
      )}
    </>
  );
}
