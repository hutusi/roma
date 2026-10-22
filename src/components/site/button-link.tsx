import Link from "next/link";
import type { ComponentProps } from "react";
import { HOUSE_BUTTON } from "./house-button";

/**
 * A link styled as the house call to action. For navigation (onward
 * links, "back to home"), where a <button> would be the wrong element.
 * `className` adds to the style (spacing, mostly); it is concatenated,
 * not merged, so this stays free of tailwind-merge in client bundles.
 */
export function ButtonLink({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link className={className ? `${HOUSE_BUTTON} ${className}` : HOUSE_BUTTON} {...props} />;
}
