"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * The editor forms' save bar: sticky at the bottom of the content column
 * (the film form's old one was fixed to the viewport, spanned the sidebar
 * and centred itself on the window; the person and list forms put save
 * at the end of a very long page). It says whether there are unsaved
 * edits and when the last save landed, and ⌘S / Ctrl+S saves.
 */
export function SaveBar({
  formId,
  dirty,
  submitting,
  savedAt,
}: {
  formId: string;
  dirty: boolean;
  submitting: boolean;
  savedAt: Date | null;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "s" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      const form = document.getElementById(formId);
      if (form instanceof HTMLFormElement) form.requestSubmit();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [formId]);

  const status = submitting
    ? "保存中…"
    : dirty
      ? "有未保存的修改"
      : savedAt
        ? `已保存 · ${savedAt.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`
        : "没有修改";

  return (
    <div className="sticky bottom-0 z-30 -mx-4 mt-8 flex items-center justify-between gap-3 border-line border-t bg-paper/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
      <p className="flex items-center gap-2 text-sm" aria-live="polite">
        {dirty && !submitting && <span className="size-2 rounded-full bg-brand" aria-hidden />}
        <span className={dirty ? "text-ink" : "text-ink-muted"}>{status}</span>
        <span className="hidden text-ink-muted text-xs sm:inline">⌘S 保存</span>
      </p>
      <Button type="submit" form={formId} disabled={submitting} className="tracking-label">
        {submitting ? "保存中…" : "保存"}
      </Button>
    </div>
  );
}
