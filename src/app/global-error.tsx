"use client";

// Last-resort boundary: only fires when a *root layout* itself throws, so
// it must render its own <html>/<body> (it replaces the root layout) and
// can't know the locale — the layout that would resolve it is what failed.
// Hence the bilingual copy. Ordinary route errors are handled by the
// per-tree (zh)/(site)/error.tsx and en/error.tsx boundaries.
import "@fontsource/noto-serif-sc/400.css";
import "@fontsource/noto-serif-sc/700.css";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/700.css";
import "./globals.css";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <main className="flex min-h-screen flex-1 flex-col items-center justify-center px-6 py-24 text-center">
          <p className="font-display text-ink-muted text-sm uppercase tracking-[0.4em]">Error</p>
          <h1 className="mt-4 font-bold text-3xl tracking-[0.2em]">放映中断</h1>
          <p className="mt-4 max-w-[42ch] text-ink-muted leading-[1.9]">
            出了点问题。请稍后再试，或回到首页。
            <br />
            Something went wrong. Please try again, or head back to the home page.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 border border-ink px-8 py-3 text-sm tracking-[0.3em] transition-colors hover:border-brand hover:text-brand"
          >
            重试 · Retry
          </button>
        </main>
      </body>
    </html>
  );
}
