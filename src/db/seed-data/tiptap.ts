/**
 * Minimal Tiptap (ProseMirror) JSON builders for seed content. They emit
 * only the nodes the shared allowlist in
 * `src/components/tiptap/extensions.ts` accepts — paragraph, heading
 * (levels 2 & 3), blockquote, bullet list, and bold/italic/link marks.
 * Anything else the public renderer (`render.tsx`) silently drops, so the
 * seed must never produce it.
 */

type Node = Record<string, unknown>;

const text = (value: string, marks?: Node[]): Node =>
  marks ? { type: "text", text: value, marks } : { type: "text", text: value };

/** Inline marks, for use inside a paragraph's content array. */
export const strong = (value: string): Node => text(value, [{ type: "bold" }]);
export const em = (value: string): Node => text(value, [{ type: "italic" }]);
export const link = (value: string, href: string): Node =>
  text(value, [{ type: "link", attrs: { href } }]);
/** Plain inline run — pair with the mark helpers inside `p([...])`. */
export const t = (value: string): Node => text(value);

const inline = (content: string | Node[]): Node[] =>
  typeof content === "string" ? [text(content)] : content;

export const p = (content: string | Node[]): Node => ({
  type: "paragraph",
  content: inline(content),
});

export const h2 = (value: string): Node => ({
  type: "heading",
  attrs: { level: 2 },
  content: [text(value)],
});

export const h3 = (value: string): Node => ({
  type: "heading",
  attrs: { level: 3 },
  content: [text(value)],
});

export const quote = (content: string | Node[]): Node => ({
  type: "blockquote",
  content: [p(content)],
});

export const ul = (items: (string | Node[])[]): Node => ({
  type: "bulletList",
  content: items.map((item) => ({ type: "listItem", content: [p(item)] })),
});

export const doc = (nodes: Node[]): Record<string, unknown> => ({
  type: "doc",
  content: nodes,
});
