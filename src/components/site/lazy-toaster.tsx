"use client";

import dynamic from "next/dynamic";

// One toaster per root layout, out of the initial bundle: toasts only
// ever follow an interaction, by which time this chunk has long loaded.
const Toaster = dynamic(() => import("@/components/ui/sonner").then((m) => m.Toaster), {
  ssr: false,
});

export function LazyToaster() {
  return <Toaster position="top-center" />;
}
