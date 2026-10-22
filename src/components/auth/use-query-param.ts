"use client";

import { useSyncExternalStore } from "react";

const subscribe = (onChange: () => void) => {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
};

/**
 * One query parameter, read without useSearchParams — which bails a
 * static page out to client rendering up to its Suspense boundary, and
 * left /sign-in and /reset-password prerendered with an empty main area.
 * `undefined` until hydration (the static HTML can't know the URL).
 */
export function useQueryParam(name: string): string | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get(name),
    () => undefined,
  );
}
