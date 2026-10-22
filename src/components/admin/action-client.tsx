"use client";

import { toast } from "sonner";
import type { ActionResult } from "@/actions/result";

const UNREACHABLE = "操作没有完成：网络或服务器出错。修改仍在页面上，请稍后再试。";

/**
 * Next's own control-flow errors (redirect, notFound) must keep
 * propagating — the router acts on them — so only real failures are
 * turned into results. They carry a NEXT_* digest.
 */
function isNextInternal(error: unknown): boolean {
  const digest = (error as { digest?: unknown } | null)?.digest;
  return typeof digest === "string" && digest.startsWith("NEXT_");
}

/**
 * Calls a server action without letting it throw. A thrown action — the
 * network dropped, the function crashed — used to escape a transition
 * into the admin error boundary, replacing the page and the editor's
 * unsaved Tiptap drafts with it, or to leave an awaited form's button
 * stuck on "保存中…". Now it is just a failed result, and the form keeps
 * what was typed.
 */
export async function callAction<T>(
  action: () => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  try {
    return await action();
  } catch (error) {
    if (isNextInternal(error)) throw error;
    console.error("[admin action]", error);
    return { ok: false, error: UNREACHABLE };
  }
}

/**
 * Reports a failed action. The guard codes get their own treatment: an
 * expired session offers sign-in in a new tab, so the form survives and
 * can be saved again afterwards.
 */
export function notifyActionError(error: string) {
  if (error === "sessionExpired") {
    toast.error("登录已过期，修改尚未保存", {
      description: "在新标签页登录后，回到这里再保存一次。",
      duration: 15_000,
      action: {
        label: "去登录",
        onClick: () => window.open("/zh/sign-in?next=%2Fadmin", "_blank", "noopener"),
      },
    });
    return;
  }
  if (error === "forbidden") {
    toast.error("没有编辑权限。");
    return;
  }
  toast.error(error);
}
