import { Skeleton } from "@/components/ui/skeleton";

// Admin pages query on every request (and editor pages load every person
// and film for their pickers): show the page's frame at once, inside the
// sidebar, instead of a click that seems to do nothing.
export default function AdminLoading() {
  return (
    <div aria-busy="true" className="space-y-6">
      <span className="sr-only" role="status">
        加载中…
      </span>
      <Skeleton className="h-7 w-48 rounded-none" aria-hidden />
      <Skeleton className="h-9 w-full max-w-sm rounded-none" aria-hidden />
      <div className="space-y-3" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-none" />
        ))}
      </div>
    </div>
  );
}
