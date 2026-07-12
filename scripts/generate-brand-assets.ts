/**
 * Generates the brand marks and every icon derived from them:
 *
 *   src/assets/brand/monogram.svg      "8½" mark (the live identity)
 *   src/assets/brand/seal.svg          红印章 variant, kept for comparison
 *   src/assets/brand/monogram-paths.ts glyph path data for <BrandMark>
 *   src/assets/brand/preview.html      both marks at 16–256px (open via file://)
 *   src/app/icon.svg                   copy of monogram.svg
 *   src/app/apple-icon.png             180×180, opaque paper
 *   src/app/favicon.ico                16+32+48 PNG-in-ICO
 *   public/icons/icon-{192,512}.png    manifest + Organization logo
 *
 * Glyphs are outlined to <path> data (favicons can't load fonts) from
 * fonts already in the repo's dependency tree — never fetched (ADR
 * 0002): Playfair Display 700 italic from @fontsource for "8½", and the
 * committed Noto Serif SC OG slices for 八部半. Deterministic: rerunning
 * without design changes must produce identical bytes.
 *
 * Run: bun run brand:generate
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import sharp from "sharp";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const brandDir = join(root, "src/assets/brand");
const iconsDir = join(root, "public/icons");
mkdirSync(brandDir, { recursive: true });
mkdirSync(iconsDir, { recursive: true });

const PAPER = "#faf8f4";
const INK = "#1a1a18";
const LINE = "#d9d5cc";
const BRAND = "#8b2e2e";

const CANVAS = 512;

function loadFont(path: string): opentype.Font {
  const buf = readFileSync(join(root, path));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

/** Bake scale+translate into path commands so consumers get plain absolute coordinates. */
function transformPath(path: opentype.Path, s: number, dx: number, dy: number): string {
  const round = (n: number) => Math.round(n * 100) / 100;
  return path.commands
    .map((c) => {
      const x = (v: number) => round(v * s + dx);
      const y = (v: number) => round(v * s + dy);
      switch (c.type) {
        case "M":
          return `M${x(c.x)} ${y(c.y)}`;
        case "L":
          return `L${x(c.x)} ${y(c.y)}`;
        case "C":
          return `C${x(c.x1)} ${y(c.y1)} ${x(c.x2)} ${y(c.y2)} ${x(c.x)} ${y(c.y)}`;
        case "Q":
          return `Q${x(c.x1)} ${y(c.y1)} ${x(c.x)} ${y(c.y)}`;
        default:
          return "Z";
      }
    })
    .join("");
}

type Box = { x1: number; y1: number; x2: number; y2: number };

function union(a: Box, b: Box): Box {
  return {
    x1: Math.min(a.x1, b.x1),
    y1: Math.min(a.y1, b.y1),
    x2: Math.max(a.x2, b.x2),
    y2: Math.max(a.y2, b.y2),
  };
}

// ---------------------------------------------------------------- monogram

const playfair = loadFont(
  "node_modules/@fontsource/playfair-display/files/playfair-display-latin-700-italic.woff",
);

const FRAME_INSET = 24;
const FRAME_STROKE = 3;

function buildMonogram(): { glyphs: { d: string; fill: string }[] } {
  const F = 100;
  const eight = playfair.charToGlyph("8");
  const half = playfair.charToGlyph("½");
  if (eight.index === 0 || half.index === 0) throw new Error("Playfair italic lacks 8 or ½");

  const scaleEm = F / playfair.unitsPerEm;
  const advance8 = (eight.advanceWidth ?? 0) * scaleEm;
  const kern = playfair.getKerningValue(eight, half) * scaleEm;
  const path8 = eight.getPath(0, 0, F);
  const pathHalf = half.getPath(advance8 + kern, 0, F);

  // Scale the pair to sit comfortably inside the hairline frame, optically centered.
  const bbox = union(path8.getBoundingBox(), pathHalf.getBoundingBox());
  const target = 316;
  const s = Math.min(target / (bbox.x2 - bbox.x1), target / (bbox.y2 - bbox.y1));
  const dx = CANVAS / 2 - (s * (bbox.x1 + bbox.x2)) / 2;
  const dy = CANVAS / 2 - (s * (bbox.y1 + bbox.y2)) / 2;

  return {
    glyphs: [
      { d: transformPath(path8, s, dx, dy), fill: INK },
      { d: transformPath(pathHalf, s, dx, dy), fill: BRAND },
    ],
  };
}

function monogramSvg(glyphs: { d: string; fill: string }[]): string {
  const frameSize = CANVAS - 2 * FRAME_INSET;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}">`,
    "<title>八部半 · 8½</title>",
    `<rect width="${CANVAS}" height="${CANVAS}" fill="${PAPER}"/>`,
    `<rect x="${FRAME_INSET}" y="${FRAME_INSET}" width="${frameSize}" height="${frameSize}" fill="none" stroke="${LINE}" stroke-width="${FRAME_STROKE}"/>`,
    ...glyphs.map((g) => `<path d="${g.d}" fill="${g.fill}"/>`),
    "</svg>",
  ].join("\n");
}

// -------------------------------------------------------------------- seal

function notoGlyph(char: string, fontSize: number): opentype.Path {
  // The OG woffs are unicode-range slices; find the one holding this char.
  for (const slice of [
    "src/assets/og/noto-serif-sc-115-700-normal.woff",
    "src/assets/og/noto-serif-sc-118-700-normal.woff",
  ]) {
    const font = loadFont(slice);
    const glyph = font.charToGlyph(char);
    if (glyph && glyph.index !== 0) return glyph.getPath(0, 0, fontSize);
  }
  throw new Error(`no OG slice contains "${char}"`);
}

function sealSvg(): string {
  // 印章 layout, read right-to-left: right column 八/部, 半 centered in
  // the left column. All three carve at ONE font size — the typeface
  // already balances ink optically within the em (八 is sparse, 部 is
  // dense, and that difference is the design); fitting each glyph's ink
  // bbox to its cell would destroy that. Only centering is per-cell.
  const F = 195;
  const cells: { char: string; box: Box }[] = [
    { char: "八", box: { x1: 268, x2: 448, y1: 64, y2: 244 } },
    { char: "部", box: { x1: 268, x2: 448, y1: 268, y2: 448 } },
    { char: "半", box: { x1: 64, x2: 244, y1: 166, y2: 346 } },
  ];
  const glyphs = cells.map(({ char, box }) => {
    const path = notoGlyph(char, F);
    const b = path.getBoundingBox();
    const dx = (box.x1 + box.x2) / 2 - (b.x1 + b.x2) / 2;
    const dy = (box.y1 + box.y2) / 2 - (b.y1 + b.y2) / 2;
    return { d: transformPath(path, 1, dx, dy), fill: PAPER };
  });
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}">`,
    "<title>八部半</title>",
    `<rect x="12" y="12" width="${CANVAS - 24}" height="${CANVAS - 24}" rx="44" fill="${BRAND}"/>`,
    ...glyphs.map((g) => `<path d="${g.d}" fill="${g.fill}"/>`),
    "</svg>",
  ].join("\n");
}

// ----------------------------------------------------------------- rasters

async function png(svg: string, size: number): Promise<Buffer> {
  const buf = await sharp(Buffer.from(svg), { density: (72 * size) / CANVAS })
    .resize(size, size)
    .flatten({ background: PAPER })
    .png()
    .toBuffer();
  if (buf.length === 0) throw new Error(`empty PNG at ${size}px`);
  return buf;
}

/** Minimal PNG-in-ICO container — valid for every modern consumer. */
function ico(images: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  const entries: Buffer[] = [];
  let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size === 256 ? 0 : size, 0);
    e.writeUInt8(size === 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // planes
    e.writeUInt16LE(32, 6); // bpp
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

// ----------------------------------------------------------------- preview

function previewHtml(monogram: string, seal: string): string {
  const sizes = [16, 32, 48, 64, 128, 256];
  const row = (svg: string) =>
    sizes
      .map(
        (s) =>
          `<figure><div style="width:${s}px;height:${s}px">${svg}</div><figcaption>${s}px</figcaption></figure>`,
      )
      .join("\n");
  const headerStrip = (mark: string) => `
    <div style="display:flex;align-items:center;gap:12px;border:1px solid ${LINE};background:${PAPER};padding:16px 24px">
      <div style="width:28px;height:28px">${mark}</div>
      <span style="font-weight:700;font-size:20px;letter-spacing:0.2em;color:${INK}">八部半</span>
      <span style="font-size:12px;letter-spacing:0.3em;color:#6b6b66;text-transform:uppercase">Babuban · 8½</span>
    </div>`;
  return `<!doctype html>
<meta charset="utf-8">
<title>Babuban brand marks — comparison</title>
<style>
  body { font: 14px/1.6 system-ui; background: #eee9e0; color: ${INK}; margin: 40px; }
  h2 { letter-spacing: 0.1em; }
  .row { display: flex; align-items: flex-end; gap: 24px; margin: 16px 0 40px; }
  figure { margin: 0; text-align: center; }
  figure svg { width: 100%; height: 100%; display: block; }
  figcaption { font-size: 11px; color: #6b6b66; margin-top: 6px; }
</style>
<h2>8½ monogram (live)</h2>
<div class="row">${row(monogram)}</div>
${headerStrip(monogram)}
<h2 style="margin-top:48px">红印章 seal (candidate)</h2>
<div class="row">${row(seal)}</div>
${headerStrip(seal)}
`;
}

// -------------------------------------------------------------------- main

const { glyphs } = buildMonogram();
const monogram = monogramSvg(glyphs);
const seal = sealSvg();

writeFileSync(join(brandDir, "monogram.svg"), `${monogram}\n`);
writeFileSync(join(brandDir, "seal.svg"), `${seal}\n`);
writeFileSync(join(root, "src/app/icon.svg"), `${monogram}\n`);
writeFileSync(join(brandDir, "preview.html"), previewHtml(monogram, seal));

// Emitted in the exact shape Biome's formatter would produce, so a
// regeneration never dirties the tree with formatting churn.
const glyphsTs = glyphs
  .map((g) => `    {\n      d: "${g.d}",\n      fill: "${g.fill}",\n    },`)
  .join("\n");
const pathsTs = `// Generated by scripts/generate-brand-assets.ts — do not edit by hand.
export const MONOGRAM = {
  viewBox: "0 0 ${CANVAS} ${CANVAS}",
  frame: { inset: ${FRAME_INSET}, stroke: "${LINE}", strokeWidth: ${FRAME_STROKE} },
  glyphs: [
${glyphsTs}
  ],
} as const;
`;
writeFileSync(join(brandDir, "monogram-paths.ts"), pathsTs);

writeFileSync(join(root, "src/app/apple-icon.png"), await png(monogram, 180));
writeFileSync(join(iconsDir, "icon-192.png"), await png(monogram, 192));
writeFileSync(join(iconsDir, "icon-512.png"), await png(monogram, 512));
writeFileSync(
  join(root, "src/app/favicon.ico"),
  ico(
    await Promise.all(
      [16, 32, 48].map(async (size) => ({ size, data: await png(monogram, size) })),
    ),
  ),
);

console.log("brand assets generated");
