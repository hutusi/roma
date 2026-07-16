/**
 * Shared "does this rich-text document actually render something" check,
 * so the publish gates and the renderer agree on what "empty" means.
 *
 * The gates used to accept any truthy object — `{ type: "doc" }` with no
 * content passed, but render.tsx (which requires a non-empty `content`
 * array) renders it as nothing, so a director could publish with a
 * blank-looking career essay. This walks the node tree for a single text
 * node bearing non-whitespace, or an atom node that renders on its own
 * (an image), which is the same "is there anything to show" question the
 * renderer answers.
 */

type Node = {
  type?: unknown;
  text?: unknown;
  content?: unknown;
};

/** Node types that render something even without text (self-contained atoms). */
const ATOM_TYPES = new Set(["image", "horizontalRule"]);

function nodeHasProse(node: unknown): boolean {
  if (!node || typeof node !== "object") return false;
  const n = node as Node;
  if (typeof n.text === "string" && n.text.trim().length > 0) return true;
  if (typeof n.type === "string" && ATOM_TYPES.has(n.type)) return true;
  if (Array.isArray(n.content)) return n.content.some(nodeHasProse);
  return false;
}

/**
 * True when `doc` is a Tiptap document that renders visible content.
 * Mirrors render.tsx's top-level guard (non-empty `content` array) and
 * then descends for actual text/atoms, so gate and renderer never
 * disagree.
 */
export function hasProse(doc: Record<string, unknown> | null | undefined): boolean {
  if (!doc || !Array.isArray(doc.content) || doc.content.length === 0) return false;
  return doc.content.some(nodeHasProse);
}
