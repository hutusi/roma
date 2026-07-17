/**
 * THE link-protocol policy — one allowlist shared by the save gate
 * (validators/prose.ts), the public renderer (render.tsx), and the
 * editor toolbar (editor.tsx), so a link can never be accepted by one
 * side and dropped by another (ADR 0004).
 *
 * Why exactly http(s) + mailto: the toolbar only submits hrefs this
 * policy approves, and autolink can only ever produce web URLs and
 * email addresses (linkify detects no phone numbers), so mailto is the
 * one non-http scheme the editor legitimately creates — and the public
 * page must render what the editor shows. Everything else is rejected
 * at save; there is nothing that can produce it.
 *
 * extensions.ts is deliberately NOT wired with Link's isAllowedUri /
 * shouldAutoLink: those receive raw matched text (e.g. "www.example.com",
 * "foo@bar.com") on some paths, not the normalized href, so a protocol
 * predicate there silently kills legitimate autolinks. The save gate is
 * the authoritative enforcement; the toolbar check is UX.
 */
export const isAllowedLinkHref = (href: unknown): href is string =>
  typeof href === "string" && /^\s*(?:https?:\/\/|mailto:)/i.test(href);
