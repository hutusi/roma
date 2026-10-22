"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { banUser, setUserRole, unbanUser } from "@/actions/admin-users";
import { callAction, notifyActionError } from "@/components/admin/action-client";
import { ConfirmButton } from "@/components/admin/confirm-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Role = "admin" | "editor" | "user";
const ROLE_LABEL: Record<Role, string> = { user: "读者", editor: "编辑", admin: "管理员" };
const isRole = (value: string): value is Role => value in ROLE_LABEL;

/**
 * Role changes ask first — the select used to fire on change, so one
 * slip promoted a reader to admin — and the select is controlled, so a
 * cancelled or failed change shows the real role again instead of the
 * one that was picked. Banning takes its reason in the dialog.
 */
export function UserRowControls({
  userId,
  name,
  role,
  banned,
  isSelf,
}: {
  userId: string;
  name: string;
  role: string;
  banned: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const current: Role = isRole(role) ? role : "user";
  const [proposed, setProposed] = useState<Role | null>(null);

  if (isSelf) {
    return <span className="text-sm">{ROLE_LABEL[current]}（我）</span>;
  }

  const changeRole = (next: Role) =>
    startTransition(async () => {
      const result = await callAction(() => setUserRole(userId, next));
      setProposed(null);
      if (!result.ok) {
        notifyActionError(result.error);
        return;
      }
      toast.success("角色已更新");
      router.refresh();
    });

  return (
    <span className="flex items-center gap-2">
      <select
        aria-label={`${name} 的角色`}
        className="h-8 border border-line-strong bg-transparent px-1 text-xs"
        value={proposed ?? current}
        disabled={pending}
        onChange={(e) => isRole(e.target.value) && setProposed(e.target.value)}
      >
        <option value="user">读者</option>
        <option value="editor">编辑</option>
        <option value="admin">管理员</option>
      </select>
      <AlertDialog open={proposed !== null} onOpenChange={(open) => !open && setProposed(null)}>
        <AlertDialogContent className="font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle>
              把 {name} 改为{proposed ? ROLE_LABEL[proposed] : ""}？
            </AlertDialogTitle>
            <AlertDialogDescription>
              {proposed === "admin"
                ? "管理员可以管理用户、邀请与所有内容。"
                : proposed === "editor"
                  ? "编辑可以编辑和发布内容。"
                  : "读者无法进入编辑部。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction variant="default" onClick={() => proposed && changeRole(proposed)}>
              确认更改
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {banned ? (
        <ConfirmButton
          size="xs"
          variant="ghost"
          disabled={pending}
          destructive={false}
          className="text-ink-muted"
          title={`解除对 ${name} 的封禁？`}
          confirmLabel="解封"
          onConfirm={() =>
            startTransition(async () => {
              const result = await callAction(() => unbanUser(userId));
              if (!result.ok) notifyActionError(result.error);
              else router.refresh();
            })
          }
        >
          解封
        </ConfirmButton>
      ) : (
        <ConfirmButton
          size="xs"
          variant="ghost"
          disabled={pending}
          className="text-ink-muted hover:text-destructive"
          title={`封禁 ${name}？`}
          description="被封禁的账号无法登录，现有会话随即失效。"
          reason={{ label: "封禁原因（可留空）" }}
          confirmLabel="封禁"
          onConfirm={(reason) =>
            startTransition(async () => {
              const result = await callAction(() => banUser(userId, reason));
              if (!result.ok) notifyActionError(result.error);
              else router.refresh();
            })
          }
        >
          封禁
        </ConfirmButton>
      )}
    </span>
  );
}
