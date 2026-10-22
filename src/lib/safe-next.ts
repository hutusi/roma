/**
 * A post-sign-in destination that can only point back into this site.
 * `next` arrives in a query string anyone can craft, so anything that
 * isn't a plain same-origin path falls back: "//evil.com" and "/\evil.com"
 * both start with "/" yet navigate cross-origin, and backslashes and
 * control characters are normalized into exactly those forms by some
 * browsers.
 */
export function safeNextPath(next: string | null | undefined, fallback: string): string {
  if (!next?.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.includes("\\")) return fallback;
  // biome-ignore lint/suspicious/noControlCharactersInRegex: rejecting control characters is the point.
  if (/[\u0000-\u001f\u007f]/.test(next)) return fallback;
  return next;
}

/** `/zh/sign-in?next=…` for the page a reader is on. */
export function signInHrefFor(signInPath: string, currentPath: string): string {
  const next = safeNextPath(currentPath, "");
  return next ? `${signInPath}?next=${encodeURIComponent(next)}` : signInPath;
}
