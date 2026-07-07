"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ActionResult } from "@/actions/result";

/**
 * Publish / unpublish / delete strip shared by film, director, and list
 * edit pages — the entity-specific server actions are injected.
 */
export function PublishControls({
  status,
  onPublish,
  onUnpublish,
  onDelete,
  deleteConfirmText,
  afterDeleteHref,
}: {
  status: "draft" | "published";
  onPublish: () => Promise<ActionResult>;
  onUnpublish: () => Promise<ActionResult>;
  onDelete: () => Promise<ActionResult>;
  deleteConfirmText: string;
  afterDeleteHref: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<ActionResult>, successMessage: string) =>
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(successMessage);
      router.refresh();
    });

  return (
    <div className="flex items-center gap-3">
      <Badge variant={status === "published" ? "default" : "secondary"}>
        {status === "published" ? "已发布" : "草稿"}
      </Badge>
      {status === "draft" ? (
        <Button size="sm" disabled={pending} onClick={() => run(onPublish, "已发布")}>
          发布
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => run(onUnpublish, "已撤回为草稿")}
        >
          撤回
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        className="text-destructive hover:text-destructive"
        onClick={() => {
          if (!window.confirm(deleteConfirmText)) return;
          startTransition(async () => {
            const result = await onDelete();
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            router.push(afterDeleteHref);
            router.refresh();
          });
        }}
      >
        删除
      </Button>
    </div>
  );
}
