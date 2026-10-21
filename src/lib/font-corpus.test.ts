import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { docRuns, fontPages, glyphCodePoints } from "./font-corpus";

const root = join(import.meta.dir, "../..");
const css = readFileSync(join(root, "src/assets/fonts/babuban-serif-sc.css"), "utf8");

function coverage(weight: 400 | 700, from = css): [number, number][] {
  return from
    .split("@font-face")
    .slice(1)
    .filter((block) => block.includes(`font-weight: ${weight};`))
    .flatMap((block) =>
      (/unicode-range:\s*([^;]+);/.exec(block)?.[1] ?? "").split(",").map((part) => {
        const [a, b] = part.trim().replace(/^U\+/, "").split("-");
        return [Number.parseInt(a, 16), Number.parseInt(b ?? a, 16)] as [number, number];
      }),
    );
}

describe("generated CJK subset (ADR 0018)", () => {
  test.each([400, 700] as const)("covers every glyph the corpus sets at %i", (weight) => {
    const ranges = coverage(weight);
    // Glyphs no Noto Serif SC file has at all (e.g. Bengali) fall back to
    // the system font whatever we generate.
    const noto = coverage(
      weight,
      readFileSync(join(root, `node_modules/@fontsource/noto-serif-sc/${weight}.css`), "utf8"),
    );
    const missing = new Set<string>();
    for (const page of fontPages(root)) {
      for (const cp of glyphCodePoints(weight === 400 ? page.regular : page.bold)) {
        if (!noto.some(([a, b]) => cp >= a && cp <= b)) continue;
        if (!ranges.some(([a, b]) => cp >= a && cp <= b)) missing.add(String.fromCodePoint(cp));
      }
    }
    // A failure here means seed-data or public UI copy changed:
    // run `bun run fonts:generate` and commit the result.
    expect([...missing].join("")).toBe("");
  });

  test("every face points at a committed file", () => {
    const urls = [...css.matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      expect(() => readFileSync(join(root, "public", url))).not.toThrow();
    }
  });
});

describe("docRuns", () => {
  test("headings and bold marks are 700, the rest 400", () => {
    const runs = docRuns({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "标题" }] },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "正文" },
            { type: "text", text: "加粗", marks: [{ type: "bold" }] },
          ],
        },
      ],
    });
    expect(runs.bold).toBe("标题\n加粗");
    expect(runs.regular).toBe("正文");
  });
});

describe("glyphCodePoints", () => {
  test("drops controls, keeps ASCII and CJK", () => {
    const cps = glyphCodePoints("A\n八\u0085");
    expect([...cps].map((c) => String.fromCodePoint(c))).toEqual(["A", "八"]);
  });
});
