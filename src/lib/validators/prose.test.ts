import { describe, expect, test } from "bun:test";
import { hasProse } from "./prose";

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
});
