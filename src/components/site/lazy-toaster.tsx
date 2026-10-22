"use client";

import dynamic from "next/dynamic";
import { type ComponentProps, useEffect } from "react";
import { markToasterReady } from "./toaster-ready";

// One toaster per root layout, out of the initial bundle. Toasts usually
// follow an interaction, by which time this chunk has loaded, but not
// always: notify.ts holds them until markToasterReady says it has.
const Toaster = dynamic(
  () =>
    import("@/components/ui/sonner").then(({ Toaster }) => {
      function ReadyToaster(props: ComponentProps<typeof Toaster>) {
        // A parent's effect runs after its children's, so by now the
        // Toaster has subscribed and a toast published will be shown.
        useEffect(markToasterReady, []);
        return <Toaster {...props} />;
      }
      return ReadyToaster;
    }),
  { ssr: false },
);

export function LazyToaster() {
  return <Toaster position="top-center" />;
}
