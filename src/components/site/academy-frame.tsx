import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * A still framed at the Academy ratio (1.37:1) on a black ground, like a
 * projected frame. Images letterbox with `object-contain` rather than
 * crop, since composition is the point. Renders an empty dark frame when
 * no image is available — pages must degrade gracefully because usable
 * stills are scarce (licensing).
 */
export function AcademyFrame({
  src,
  alt,
  caption,
  credit,
  sizes = "(min-width: 1024px) 896px, 100vw",
  priority = false,
  className,
}: {
  src?: string | null;
  alt: string;
  caption?: string;
  credit?: string | null;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={cn("w-full", className)}>
      <div className="relative aspect-[137/100] w-full overflow-hidden bg-ink">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-contain"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-full items-center justify-center font-display text-sm tracking-[0.3em] text-paper/30"
          >
            1.37 : 1
          </div>
        )}
      </div>
      {(caption || credit) && (
        <figcaption className="mt-2 flex items-baseline justify-between gap-4 text-xs text-ink-muted">
          <span>{caption}</span>
          {credit && <span className="shrink-0">图片来源：{credit}</span>}
        </figcaption>
      )}
    </figure>
  );
}
