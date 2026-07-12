"use client";

// The admin subtree had no error boundary, so an editor hitting a thrown
// server component saw the default Next error page. This keeps the admin
// chrome (the layout renders around it) and offers a retry. Admin is
// zh-only, so the copy is zh.
export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-24 text-center font-sans">
      <p className="text-ink-muted text-sm uppercase tracking-[0.3em]">Error</p>
      <h1 className="mt-3 font-bold text-2xl tracking-[0.1em]">出错了</h1>
      <p className="mt-3 max-w-[40ch] text-ink-muted leading-[1.9]">
        编辑部页面加载失败。请重试；若持续出现，请检查服务端日志。
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 border border-ink px-6 py-2.5 text-sm tracking-[0.2em] transition-colors hover:border-brand hover:text-brand"
      >
        重试
      </button>
    </div>
  );
}
