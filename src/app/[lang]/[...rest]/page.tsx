import { notFound } from "next/navigation";

/**
 * Strays under a valid locale (/zh/*, /en/*) get the styled 404 in
 * not-found.tsx. Paths with no valid locale get Next's bare 404 —
 * there is no root layout above [lang] to style them (global-not-found
 * is still experimental; revisit when it stabilizes, ADR 0012).
 *
 */
export default function CatchAll() {
  notFound();
}
