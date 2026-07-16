import { getSchema, type JSONContent, rewriteUnknownContent } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { z } from "zod";
import { essayExtensions } from "@/components/tiptap/extensions";

/**
 * The image sources the renderer will actually draw — our own uploads or
 * Vercel Blob. The save validator, publish gate, and renderer share this
 * rule so content can never be accepted and then silently disappear.
 */
export const isAllowedImageSrc = (src: unknown): src is string =>
  typeof src === "string" &&
  (src.startsWith("/uploads/") ||
    /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(src));

const isSafeHref = (href: unknown): href is string =>
  typeof href === "string" && /^https?:\/\//i.test(href);

const essaySchema = getSchema(essayExtensions);

type ValidationResult =
  | { success: true; node: ProseMirrorNode }
  | { success: false; message: string };

function unsafeAttributeMessage(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const node = value as {
    type?: unknown;
    attrs?: Record<string, unknown>;
    marks?: unknown;
    content?: unknown;
  };

  if (node.type === "image" && !isAllowedImageSrc(node.attrs?.src)) {
    return "富文本图片地址无效，只能使用本站上传的图片";
  }
  if (node.type === "heading" && node.attrs?.level !== 2 && node.attrs?.level !== 3) {
    return "富文本标题只支持二级或三级标题";
  }
  if (Array.isArray(node.marks)) {
    for (const mark of node.marks) {
      if (
        mark &&
        typeof mark === "object" &&
        (mark as { type?: unknown }).type === "link" &&
        !isSafeHref((mark as { attrs?: Record<string, unknown> }).attrs?.href)
      ) {
        return "富文本链接仅支持 http(s) 地址";
      }
    }
  }
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      const message = unsafeAttributeMessage(child);
      if (message) return message;
    }
  }
  return null;
}

/**
 * Parses a stored document through the exact editor/renderer schema.
 * Unknown nodes or marks are reported instead of rewritten: silently
 * dropping authored content would violate the shared extension contract.
 */
export function validateTiptapDoc(value: unknown): ValidationResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { success: false, message: "富文本数据格式无效" };
  }
  const json = structuredClone(value) as JSONContent;
  if (json.type !== "doc") {
    return { success: false, message: "富文本根节点必须是 doc" };
  }

  try {
    const { rewrittenContent } = rewriteUnknownContent(structuredClone(json), essaySchema, {
      fallbackToParagraph: false,
    });
    if (rewrittenContent.length > 0) {
      const names = [...new Set(rewrittenContent.map((item) => item.unsupported))].join("、");
      return { success: false, message: `富文本包含不支持的内容：${names}` };
    }

    const unsafeMessage = unsafeAttributeMessage(json);
    if (unsafeMessage) return { success: false, message: unsafeMessage };

    const node = essaySchema.nodeFromJSON(json);
    node.check();
    return { success: true, node };
  } catch {
    return { success: false, message: "富文本结构无效，请重新编辑后保存" };
  }
}

const tiptapObjectSchema = z.record(z.string(), z.unknown()).superRefine((value, ctx) => {
  const result = validateTiptapDoc(value);
  if (!result.success) ctx.addIssue({ code: "custom", message: result.message });
});

/** Shared persistence schema for every optional Tiptap field. */
export const tiptapDocSchema = tiptapObjectSchema.nullable().optional();

/**
 * True only when a valid document contains something the public renderer
 * displays: non-whitespace text, a horizontal rule, or an allowed image.
 */
export function hasProse(doc: Record<string, unknown> | null | undefined): boolean {
  if (!doc) return false;
  const parsed = validateTiptapDoc(doc);
  if (!parsed.success) return false;

  let visible = false;
  parsed.node.descendants((node) => {
    if (visible) return false;
    if (node.isText && node.text?.trim()) {
      visible = true;
      return false;
    }
    if (node.type.name === "horizontalRule") {
      visible = true;
      return false;
    }
    if (node.type.name === "image" && isAllowedImageSrc(node.attrs.src)) {
      visible = true;
      return false;
    }
    return true;
  });
  return visible;
}
