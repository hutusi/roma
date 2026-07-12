import { serializeJsonLd } from "@/lib/structured-data";

/**
 * Emits a JSON-LD data block. This is the one place the codebase uses
 * dangerouslySetInnerHTML, and it is NOT the anti-pattern AGENTS.md bans
 * (rendering stored rich text as DOM HTML — an XSS surface): here we emit
 * a machine-readable <script type="application/ld+json"> whose content
 * never becomes DOM, and serializeJsonLd escapes "<" so no field value
 * can break out of the element. A text child can't be used instead —
 * React would HTML-escape it and corrupt the JSON for crawlers.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: safe serialized JSON-LD data block, see file comment
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
