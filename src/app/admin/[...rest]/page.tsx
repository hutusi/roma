import { notFound } from "next/navigation";

// /admin/* strays no longer fall into a site tree's catch-all, so the
// admin root layout needs its own: route them to admin/not-found.tsx.
export default function AdminCatchAll() {
  notFound();
}
