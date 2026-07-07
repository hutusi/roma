import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

/**
 * OG-card factory. Self-contained fonts: two Noto Serif SC slices that
 * cover exactly the 八部半 wordmark, plus Playfair latin for titles —
 * no runtime font fetching (Google's CDN can't be a dependency here).
 * Arbitrary Chinese film titles ride in og:title text instead.
 */
const fontDir = path.join(process.cwd(), "src/assets/og");
const notoA = readFile(path.join(fontDir, "noto-serif-sc-115-700-normal.woff"));
const notoB = readFile(path.join(fontDir, "noto-serif-sc-118-700-normal.woff"));
const playfair = readFile(
  path.join(fontDir, "playfair-display-latin-700-normal.woff"),
);

export const OG_SIZE = { width: 1200, height: 630 };

export async function ogCard({
  title,
  subtitle,
  kicker,
}: {
  /** Latin text (Playfair). */
  title: string;
  subtitle?: string;
  kicker?: string;
}) {
  const [a, b, p] = await Promise.all([notoA, notoB, playfair]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#faf8f4",
          color: "#1a1a18",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 28,
            border: "2px solid #d9d5cc",
            display: "flex",
          }}
        />
        <div
          style={{
            fontFamily: "Noto Serif SC",
            fontSize: 64,
            letterSpacing: "0.35em",
            display: "flex",
          }}
        >
          八部半
        </div>
        {kicker && (
          <div
            style={{
              marginTop: 28,
              fontFamily: "Playfair Display",
              fontSize: 24,
              letterSpacing: "0.4em",
              color: "#6b6b66",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {kicker}
          </div>
        )}
        <div
          style={{
            marginTop: 20,
            fontFamily: "Playfair Display",
            fontSize: title.length > 28 ? 44 : 58,
            textAlign: "center",
            maxWidth: 980,
            display: "flex",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              marginTop: 22,
              fontFamily: "Playfair Display",
              fontSize: 26,
              letterSpacing: "0.25em",
              color: "#8b2e2e",
              display: "flex",
            }}
          >
            {subtitle}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: 56,
            fontFamily: "Playfair Display",
            fontSize: 18,
            letterSpacing: "0.45em",
            color: "#6b6b66",
            display: "flex",
          }}
        >
          BABUBAN.COM
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Noto Serif SC", data: a, weight: 700 },
        { name: "Noto Serif SC", data: b, weight: 700 },
        { name: "Playfair Display", data: p, weight: 700 },
      ],
    },
  );
}
