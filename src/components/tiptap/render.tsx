import type { JSONContent } from "@tiptap/core";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { essayExtensions } from "./extensions";

/**
 * The only way Tiptap JSON reaches public HTML. Renders through the
 * SAME extension list the editor uses; unknown nodes/marks render
 * nothing rather than guessing. No dangerouslySetInnerHTML anywhere.
 */

const isSafeHref = (href: unknown): href is string =>
  typeof href === "string" && /^https?:\/\//i.test(href);

const isAllowedImageSrc = (src: unknown): src is string =>
  typeof src === "string" &&
  (src.startsWith("/uploads/") ||
    /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(src));

export function TiptapContent({
  doc,
  className,
}: {
  doc: Record<string, unknown> | null | undefined;
  className?: string;
}) {
  if (!doc || !Array.isArray(doc.content) || doc.content.length === 0) {
    return null;
  }

  const rendered = renderToReactElement({
    content: doc as JSONContent,
    extensions: essayExtensions,
    options: {
      nodeMapping: {
        image: ({ node }) => {
          const src = node.attrs?.src;
          if (!isAllowedImageSrc(src)) return null;
          const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
          return (
            <span className="relative my-8 block aspect-[137/100] w-full overflow-hidden bg-ink">
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(min-width: 1024px) 700px, 100vw"
                className="object-contain"
              />
            </span>
          );
        },
      },
      markMapping: {
        link: ({ mark, children }) => {
          const href = mark.attrs?.href;
          if (!isSafeHref(href)) return <>{children}</>;
          return (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          );
        },
      },
      unhandledNode: () => null,
      unhandledMark: ({ children }) => <>{children}</>,
    },
  });

  return (
    <div
      className={cn(
        "prose prose-neutral max-w-none font-body text-ink",
        "prose-p:leading-[1.9] prose-p:tracking-[0.02em]",
        "prose-headings:font-bold prose-headings:tracking-[0.1em]",
        "prose-a:text-brand prose-a:no-underline hover:prose-a:underline",
        "prose-blockquote:border-l-line prose-blockquote:font-normal prose-blockquote:text-ink-muted prose-blockquote:not-italic",
        className,
      )}
    >
      {rendered}
    </div>
  );
}
