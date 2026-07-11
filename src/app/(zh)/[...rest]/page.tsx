import { notFound } from "next/navigation";

/**
 * With two root layouts there is no app-level not-found for unmatched
 * URLs (global-not-found is still experimental), so each tree catches
 * its own strays and routes them to its styled 404.
 */
export default function CatchAll() {
  notFound();
}
