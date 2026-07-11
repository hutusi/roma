"use client";

export default function EnError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-display text-ink-muted text-sm uppercase tracking-[0.4em]">Error</p>
      <h1 className="mt-4 font-bold text-3xl tracking-[0.2em]">Projection interrupted</h1>
      <p className="mt-4 max-w-[40ch] text-ink-muted leading-[1.9]">
        Something went wrong. Please try again, or head back to the home page.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 border border-ink px-8 py-3 text-sm tracking-[0.3em] transition-colors hover:border-brand hover:text-brand"
      >
        Try again
      </button>
    </main>
  );
}
