import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Instant feedback for the per-reader pages (account, follows, profiles,
 * user lists), which render on request: the title card's frame and the
 * shape of what is coming, so a click registers before the data does.
 * Editorial pages are static and never need it. loading.tsx gets no
 * params, so the screen-reader label carries both editions.
 */
export function PageSkeleton({ variant }: { variant: "form" | "rows" | "cards" }) {
  return (
    <div
      className={cn("mx-auto px-6 pt-16", variant === "form" ? "max-w-md" : "max-w-3xl")}
      aria-busy="true"
    >
      <span className="sr-only" role="status">
        加载中 · Loading
      </span>
      <div className="mx-auto max-w-2xl border-line border-y py-5" aria-hidden>
        <Skeleton className="mx-auto h-3 w-24 rounded-none" />
        <Skeleton className="mx-auto mt-3 h-7 w-48 rounded-none" />
      </div>
      <div aria-hidden className="mt-10">
        {variant === "form" && (
          <div className="space-y-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16 rounded-none" />
                <Skeleton className="h-9 w-full rounded-none" />
              </div>
            ))}
          </div>
        )}
        {variant === "rows" && (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-none" />
            ))}
          </div>
        )}
        {variant === "cards" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-none" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
