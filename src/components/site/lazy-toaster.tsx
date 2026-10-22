"use client";

import dynamic from "next/dynamic";

// One toaster per root layout, out of the initial bundle. Toasts usually
// follow an interaction, by which time this chunk has loaded, but not
// always: notify.ts holds them until the Toaster says it is ready.
const Toaster = dynamic(() => import("@/components/ui/sonner").then((m) => m.Toaster), {
  ssr: false,
});

export function LazyToaster() {
  return <Toaster position="top-center" />;
}
