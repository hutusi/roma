import type { VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A link styled as a button — the house call to action by default. For
 * navigation (onward links, "back to home"), where a <button> would be
 * the wrong element.
 */
export function ButtonLink({
  variant = "house",
  size = "house",
  className,
  ...props
}: ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
