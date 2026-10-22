import { PageSkeleton } from "@/components/site/page-skeleton";

// Per-reader and rendered on request: show the frame at once. (A
// streamed boundary turns a notFound() here into a soft 404 — fine for
// these noindex pages.)
export default function Loading() {
  return <PageSkeleton variant="rows" />;
}
