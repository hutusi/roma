"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

// Keeps the admin chrome (the layout renders around it) and offers a
// retry, a way back to the desk, and the error id to look up in the
// server log. Admin is zh-only, so the copy is zh.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-24 text-center font-sans">
      <p className="text-ink-muted text-sm uppercase tracking-eyebrow">Error</p>
      <h1 className="mt-3 font-bold text-2xl tracking-title">出错了</h1>
      <p className="mt-3 max-w-[40ch] text-ink-muted leading-[1.9]">
        编辑部页面加载失败。请重试；若持续出现，请凭错误编号查看服务端日志。
      </p>
      <div className="mt-6 flex items-center gap-6">
        <button type="button" onClick={reset} className={buttonVariants({ variant: "outline" })}>
          重试
        </button>
        <Link href="/admin" className="text-ink-muted text-sm hover:text-brand">
          回到编辑部首页
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 text-ink-muted text-xs">
          错误编号：<code className="font-mono">{error.digest}</code>
        </p>
      )}
    </div>
  );
}
