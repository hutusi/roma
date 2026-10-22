import { notFound } from "next/navigation";

/**
 * Strays get the styled 404 in not-found.tsx, inside the site chrome —
 * under a valid locale (/zh/*, /en/*) and without one (/foo/bar), since
 * the [lang] layout renders zh chrome for an unknown locale.
 */
export default function CatchAll() {
  notFound();
}
