"use client";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-display text-sm uppercase tracking-[0.4em] text-ink-muted">
        Error
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-[0.2em]">放映中断</h1>
      <p className="mt-4 max-w-[40ch] leading-[1.9] text-ink-muted">
        出了点问题。请稍后再试，或回到首页。
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 border border-ink px-8 py-3 text-sm tracking-[0.3em] transition-colors hover:border-brand hover:text-brand"
      >
        重试
      </button>
    </main>
  );
}
