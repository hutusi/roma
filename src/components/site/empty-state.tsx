import type { ReactNode } from "react";
import { ButtonLink } from "@/components/site/button-link";

/**
 * What a page says when it has nothing to show — and where to go
 * instead. Every empty list, result set and tab uses this, so none of
 * them is a dead end: give it an `action` unless the surrounding page
 * already offers the obvious next step.
 */
export function EmptyState({
  title,
  children,
  action,
  className,
}: {
  title?: string;
  children?: ReactNode;
  action?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div className={`mx-auto mt-12 max-w-md text-center ${className ?? ""}`}>
      {title && <p className="font-bold tracking-title">{title}</p>}
      {children && (
        <div className={`text-ink-muted text-sm leading-relaxed${title ? "mt-2" : ""}`}>
          {children}
        </div>
      )}
      {action && (
        <ButtonLink href={action.href} className="mt-6">
          {action.label}
        </ButtonLink>
      )}
    </div>
  );
}
