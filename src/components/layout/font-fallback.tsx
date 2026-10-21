"use client";

import { useEffect } from "react";

/**
 * Loads the full Fontsource Noto Serif SC (~100 unicode-range slices per
 * weight) once the page is idle. The generated "Babuban Serif SC" subset
 * covers everything the corpus and UI render (ADR 0018); this only
 * matters for characters added since the last `bun run fonts:generate` —
 * e.g. a new admin-edited film — which show in the system serif until
 * their slice arrives. Off the critical path on purpose: its ~60 KB gz
 * of @font-face rules used to block every first paint.
 */
export function FontFallback() {
  useEffect(() => {
    const load = () => void import("./font-fallback-css");
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(load, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(load, 2000);
    return () => clearTimeout(id);
  }, []);
  return null;
}
