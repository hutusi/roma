"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useEffect } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { markToasterReady } from "@/components/site/toaster-ready";

// Pinned light: the site has no dark mode yet, and following the OS
// rendered dark toasts on the paper UI for dark-mode readers.
const Toaster = ({ ...props }: ToasterProps) => {
  // notify.ts holds each toast until a Toaster can show it (sonner drops
  // one published before it subscribes). Signalled here, in the one
  // Toaster both roots use, so it holds in the admin too: the public
  // header it renders in previews reports through notify. A parent's
  // effect runs after its children's, so sonner has subscribed by now.
  useEffect(markToasterReady, []);
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
