"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/actions/result";
import { callAction, notifyActionError } from "@/components/admin/action-client";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Publish / unpublish / delete strip shared by film, director, and list
 * edit pages — the entity-specific server actions are injected. The
 * English-edition strip reuses it with a label and no delete (deleting
 * belongs to the entity, not an edition).
 */
export function PublishControls({
  status,
  label,
  onPublish,
  onUnpublish,
  onDelete,
  deleteConfirmText,
  unpublishConfirmText,
  afterDeleteHref,
  problems = [],
}: {
  status: "draft" | "published";
  label?: string;
  onPublish: () => Promise<ActionResult>;
  onUnpublish: () => Promise<ActionResult>;
  onDelete?: () => Promise<ActionResult>;
  deleteConfirmText?: string;
  /** Said before unpublishing — what readers lose, and any knock-on effect. */
  unpublishConfirmText?: string;
  afterDeleteHref?: string;
  /** Unmet publish requirements (saved state); publishing waits until there are none. */
  problems?: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<ActionResult>, successMessage: string) =>
    startTransition(async () => {
      const result = await callAction(fn);
      if (!result.ok) {
        notifyActionError(result.error);
        return;
      }
      toast.success(successMessage);
      router.refresh();
    });

  return (
    <div className="flex items-center gap-3 whitespace-nowrap">
      {label && <span className="text-ink-muted text-sm">{label}</span>}
      <Badge variant={status === "published" ? "default" : "secondary"}>
        {status === "published" ? "已发布" : "草稿"}
      </Badge>
      {status === "draft" ? (
        <Button
          size="sm"
          disabled={pending || problems.length > 0}
          title={problems.length > 0 ? `尚不能发布：${problems.join("；")}` : undefined}
          onClick={() => run(onPublish, "已发布")}
        >
          {label ? `发布${label}` : "发布"}
        </Button>
      ) : (
        <ConfirmButton
          size="sm"
          variant="outline"
          disabled={pending}
          destructive={false}
          title={label ? `撤回${label}？` : "撤回为草稿？"}
          description={unpublishConfirmText ?? "撤回后读者将无法访问这一页，可以随时重新发布。"}
          confirmLabel="撤回"
          onConfirm={() => run(onUnpublish, "已撤回为草稿")}
        >
          {label ? `撤回${label}` : "撤回"}
        </ConfirmButton>
      )}
      {onDelete && (
        <ConfirmButton
          size="sm"
          variant="ghost"
          disabled={pending}
          className="text-destructive hover:text-destructive"
          title="删除这一项？"
          description={deleteConfirmText ?? "删除后无法恢复。"}
          confirmLabel="删除"
          onConfirm={() =>
            startTransition(async () => {
              const result = await callAction(onDelete);
              if (!result.ok) {
                notifyActionError(result.error);
                return;
              }
              toast.success("已删除");
              if (afterDeleteHref) router.push(afterDeleteHref);
              router.refresh();
            })
          }
        >
          删除
        </ConfirmButton>
      )}
    </div>
  );
}
