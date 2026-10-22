/**
 * The house call to action — square, hairline ink border, letter-spaced —
 * as a plain class string. Client modules that load on every page (the
 * error and not-found boundaries, the language switch) use this instead
 * of Button's `house` variant, because cva + tailwind-merge would ride
 * into every page's first-load JS (~15 KB gz) for one button.
 */
// It wraps below sm: letter-spaced and unbroken, "Read the Chinese
// edition →" measured ~376px and ran off both edges of a 320px screen.
export const HOUSE_BUTTON =
  "inline-flex max-w-full items-center justify-center border border-ink px-5 py-3 text-center text-ink text-sm tracking-eyebrow transition-colors hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-50 sm:whitespace-nowrap sm:px-8";
