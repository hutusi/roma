// Minimal declarations for the untyped font tooling used by
// scripts/generate-fonts.ts — only the calls it makes.

declare module "fontverter" {
  type Format = "sfnt" | "truetype" | "woff" | "woff2";
  const fontverter: {
    convert(buffer: Uint8Array, toFormat: Format, fromFormat?: Format): Promise<Buffer>;
    detectFormat(buffer: Uint8Array): Exclude<Format, "truetype">;
  };
  export default fontverter;
}

declare module "subset-font" {
  export default function subsetFont(
    buffer: Uint8Array,
    text: string,
    options?: {
      targetFormat?: "sfnt" | "truetype" | "woff" | "woff2";
      preserveNameIds?: number[];
      variationAxes?: Record<string, number | { min: number; max: number; default?: number }>;
    },
  ): Promise<Buffer>;
}
