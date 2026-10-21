/**
 * The house call to action — square, hairline ink border, letter-spaced —
 * as a plain class string. Client modules that load on every page (the
 * error and not-found boundaries, the language switch) use this instead
 * of Button's `house` variant, because cva + tailwind-merge would ride
 * into every page's first-load JS (~15 KB gz) for one button.
 */
export const HOUSE_BUTTON =
  "inline-flex items-center justify-center whitespace-nowrap border border-ink px-8 py-3 text-ink text-sm tracking-eyebrow transition-colors hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-50";
