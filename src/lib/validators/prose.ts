/**
 * Shared "does this rich-text document actually render something" check,
 * so the publish gates and the renderer agree on what "empty" means.
 *
 * The gates used to accept any truthy object — `{ type: "doc" }` with no
 * content passed, but render.tsx (which requires a non-empty `content`
 * array) renders it as nothing, so a director could publish with a
 * blank-looking career essay. This walks the node tree for a single text
 * node bearing non-whitespace, or an atom node that renders on its own
 * (an image with an allowed src), which is the same "is there anything
 * to show" question the renderer answers.
 */

type Node = {
  type?: unknown;
  text?: unknown;
  attrs?: unknown;
  content?: unknown;
};

/**
 * The image sources the renderer will actually draw — our own uploads or
 * Vercel Blob. Defined here (not in render.tsx) so the publish gate and
 * the renderer share one rule: an image the renderer would reject must
 * not count as visible content either.
 */
export const isAllowedImageSrc = (src: unknown): src is string =>
  typeof src === "string" &&
  (src.startsWith("/uploads/") ||
    /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(src));

function nodeHasProse(node: unknown): boolean {
  if (!node || typeof node !== "object") return false;
  const n = node as Node;
  if (typeof n.text === "string" && n.text.trim().length > 0) return true;
  // Self-contained atoms that render without text. An image only counts
  // if the renderer would accept its src — a disallowed one draws nothing.
  if (n.type === "horizontalRule") return true;
  if (n.type === "image") {
    const attrs = n.attrs as { src?: unknown } | undefined;
    return isAllowedImageSrc(attrs?.src);
  }
  if (Array.isArray(n.content)) return n.content.some(nodeHasProse);
  return false;
}

/**
 * True when `doc` is a Tiptap document that renders visible content.
 * Requires the root to be a real doc node — the static renderer throws
 * on anything else, which render.tsx catches into an empty render — and
 * then descends for actual text/atoms, so gate and renderer never
 * disagree.
 */
export function hasProse(doc: Record<string, unknown> | null | undefined): boolean {
  if (doc?.type !== "doc" || !Array.isArray(doc.content) || doc.content.length === 0) {
    return false;
  }
  return doc.content.some(nodeHasProse);
}
