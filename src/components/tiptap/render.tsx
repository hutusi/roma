import type { JSONContent } from "@tiptap/core";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import Image from "next/image";
import type React from "react";
import { cn } from "@/lib/utils";
// The image-src allowlist lives with the validators so the publish gate
// (hasProse) and this renderer share one definition of "this image draws".
import { isAllowedImageSrc } from "@/lib/validators/prose";
import { essayExtensions } from "./extensions";
import { isAllowedLinkHref } from "./link-policy";

/**
 * The only way Tiptap JSON reaches public HTML. Renders through the
 * SAME extension list the editor uses; unknown nodes/marks render
 * nothing rather than guessing. No dangerouslySetInnerHTML anywhere.
 */

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

  // The top-level guard above only checks `content` is a non-empty array;
  // a structurally-corrupt child (e.g. a node whose `content` is a string,
  // not an array) can still reach the renderer and throw. This is a
  // public server component, so an uncaught throw would break the whole
  // page over one bad essay. Stored JSON always comes from the admin
  // editor, so corruption means a bad direct write — degrade to rendering
  // nothing rather than 500 the page. Not a substitute for validating on
  // the way in; a last-resort guard.
  let rendered: React.ReactNode = null;
  try {
    rendered = renderToReactElement({
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
            if (!isAllowedLinkHref(href)) return <>{children}</>;
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
  } catch (error) {
    // Degrade for the reader, but leave a trace for operators: stored
    // JSON only corrupts via a direct DB write, and a silent null would
    // make affected pages render empty with nothing in the log drain.
    console.error("TiptapContent: malformed stored document", error);
    return null;
  }

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
