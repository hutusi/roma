"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

/**
 * A Link that prefetches on intent — pointer over it, keyboard focus on
 * it, a finger landing on it — instead of when it scrolls into view.
 * Next prefetches every static route a Link shows, so scrolling /films
 * pulled ~74 film payloads in the background; on a phone in mainland
 * China that is real data and bandwidth for pages nobody opened. In the
 * App Router, prefetch={false} also turns off hover prefetch, hence the
 * handlers.
 */
export function IntentLink({ href, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const router = useRouter();
  const prefetch = () => router.prefetch(href);
  return (
    <Link
      href={href}
      prefetch={false}
      onPointerEnter={prefetch}
      onFocus={prefetch}
      onTouchStart={prefetch}
      {...props}
    />
  );
}
