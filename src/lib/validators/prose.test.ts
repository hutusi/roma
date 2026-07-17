import { describe, expect, test } from "bun:test";
import { hasProse, tiptapDocSchema, validateTiptapDoc } from "./prose";

const doc = (...content: unknown[]) => ({ type: "doc", content });
const para = (text: string) => ({ type: "paragraph", content: [{ type: "text", text }] });

describe("hasProse", () => {
  test("false for null / undefined / non-doc", () => {
    expect(hasProse(null)).toBe(false);
    expect(hasProse(undefined)).toBe(false);
    expect(hasProse({})).toBe(false);
  });

  test("false for an empty doc — the exact case the gate used to accept", () => {
    expect(hasProse({ type: "doc" })).toBe(false);
    expect(hasProse({ type: "doc", content: [] })).toBe(false);
  });

  test("false for a doc whose only text is whitespace", () => {
    expect(hasProse(doc(para("   ")))).toBe(false);
    expect(hasProse(doc({ type: "paragraph", content: [] }))).toBe(false);
  });

  test("true when any node bears non-whitespace text, however deep", () => {
    expect(hasProse(doc(para("意大利导演。")))).toBe(true);
    expect(
      hasProse(
        doc({
          type: "blockquote",
          content: [para("nested")],
        }),
      ),
    ).toBe(true);
  });

  test("true for a self-contained atom (image) with no text — allowed srcs only", () => {
    expect(hasProse(doc({ type: "image", attrs: { src: "/uploads/x.png" } }))).toBe(true);
    expect(
      hasProse(
        doc({
          type: "image",
          attrs: { src: "https://abc-123.public.blob.vercel-storage.com/media/x.png" },
        }),
      ),
    ).toBe(true);
  });

  test("false for an image the renderer would refuse to draw", () => {
    // The renderer's allowlist rejects these, so they render as nothing —
    // the gate must not count them as content.
    expect(hasProse(doc({ type: "image", attrs: { src: "https://evil.example/x.png" } }))).toBe(
      false,
    );
    expect(hasProse(doc({ type: "image", attrs: {} }))).toBe(false);
    expect(hasProse(doc({ type: "image" }))).toBe(false);
  });

  test("false for a doc missing its root type — the static renderer throws on it", () => {
    expect(hasProse({ content: [para("text without a doc root")] })).toBe(false);
    expect(hasProse({ type: "paragraph", content: [para("wrong root type")] })).toBe(false);
  });

  test("does not throw on structurally malformed nodes", () => {
    // content that isn't an array, a null child — must be handled, not thrown.
    expect(hasProse(doc({ type: "paragraph", content: "not-an-array" }))).toBe(false);
    expect(hasProse({ type: "doc", content: [null] })).toBe(false);
  });

  test("rejects unknown nodes even when their subtree contains visible text", () => {
    const value = doc({ type: "unknownWrapper", content: [para("must not be silently dropped")] });
    expect(validateTiptapDoc(value)).toMatchObject({
      success: false,
      message: "富文本包含不支持的内容：unknownWrapper",
    });
    expect(tiptapDocSchema.safeParse(value).success).toBe(false);
    expect(hasProse(value)).toBe(false);
  });

  test("rejects unknown marks", () => {
    const value = doc({
      type: "paragraph",
      content: [{ type: "text", text: "marked", marks: [{ type: "rainbow" }] }],
    });
    expect(validateTiptapDoc(value)).toMatchObject({
      success: false,
      message: "富文本包含不支持的内容：rainbow",
    });
  });

  test("rejects attributes the renderer would strip or cannot represent", () => {
    expect(
      validateTiptapDoc(
        doc({
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "unsafe",
              marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
            },
          ],
        }),
      ),
    ).toMatchObject({ success: false, message: "富文本链接包含不安全的协议" });
    expect(
      validateTiptapDoc(doc({ type: "heading", attrs: { level: 1 }, content: [] })),
    ).toMatchObject({ success: false, message: "富文本标题只支持二级或三级标题" });
  });

  test("accepts the links the editor legitimately produces", () => {
    // The gate blocks dangerous schemes only. An http(s) link is the
    // normal case; a mailto: link is what autolink creates from a typed
    // email address — rejecting it made the whole document unsaveable
    // (the renderer degrades it to plain text instead).
    const linked = (href: string) =>
      doc({
        type: "paragraph",
        content: [{ type: "text", text: "联系方式", marks: [{ type: "link", attrs: { href } }] }],
      });
    expect(validateTiptapDoc(linked("https://example.com/a")).success).toBe(true);
    expect(validateTiptapDoc(linked("mailto:foo@bar.com")).success).toBe(true);
    expect(validateTiptapDoc(linked("tel:+861234567")).success).toBe(true);
    // And the text still counts as prose even when the renderer will
    // drop the anchor.
    expect(hasProse(linked("mailto:foo@bar.com"))).toBe(true);
  });

  test("rejects dangerous link schemes however they are spelled", () => {
    const linked = (href: string) =>
      doc({
        type: "paragraph",
        content: [{ type: "text", text: "x", marks: [{ type: "link", attrs: { href } }] }],
      });
    for (const href of ["data:text/html,x", "  JAVASCRIPT:alert(1)", "vbscript:x", "file:///etc"]) {
      expect(validateTiptapDoc(linked(href)).success).toBe(false);
    }
  });

  test("accepts a structurally valid but visibly empty document", () => {
    const value = doc({ type: "paragraph" });
    expect(validateTiptapDoc(value).success).toBe(true);
    expect(hasProse(value)).toBe(false);
  });
});
