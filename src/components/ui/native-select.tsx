import { ChevronDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * The one style for native <select>s (filters, pickers): square, a 3:1
 * edge, the site's paper and ink, a quiet chevron. Native on purpose —
 * mobile pickers and keyboard behaviour for free, no JS. Always give it
 * an accessible name (a <label htmlFor> or aria-label).
 */
export function NativeSelect({
  className,
  wrapperClassName,
  ...props
}: ComponentProps<"select"> & { wrapperClassName?: string }) {
  return (
    <span className={cn("relative inline-flex", wrapperClassName)}>
      <select
        className={cn(
          "h-9 w-full min-w-0 appearance-none border border-line-strong bg-paper py-0 pr-8 pl-3 text-ink text-sm transition-colors hover:border-ink focus-visible:border-brand disabled:opacity-50",
          className,
        )}
        {...props}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-ink-muted"
        aria-hidden
      />
    </span>
  );
}
