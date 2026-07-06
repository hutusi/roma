"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { banUser, setUserRole, unbanUser } from "@/actions/admin-users";

export function UserRowControls({
  userId,
  role,
  banned,
  isSelf,
}: {
  userId: string;
  role: string;
  banned: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (isSelf) {
    return <span className="text-sm">{role === "admin" ? "管理员（我）" : role}</span>;
  }

  return (
    <span className="flex items-center gap-2">
      <select
        className="h-8 border border-input bg-transparent px-1 text-xs"
        defaultValue={role}
        disabled={pending}
        onChange={(e) =>
          startTransition(async () => {
            const result = await setUserRole(
              userId,
              e.target.value as "admin" | "editor" | "user",
            );
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("角色已更新");
            router.refresh();
          })
        }
      >
        <option value="user">读者</option>
        <option value="editor">编辑</option>
        <option value="admin">管理员</option>
      </select>
      <button
        type="button"
        disabled={pending}
        className="text-xs text-ink-muted hover:text-destructive"
        onClick={() => {
          if (banned) {
            startTransition(async () => {
              const result = await unbanUser(userId);
              if (!result.ok) toast.error(result.error);
              else router.refresh();
            });
            return;
          }
          const reason = window.prompt("封禁原因（可留空）");
          if (reason === null) return;
          startTransition(async () => {
            const result = await banUser(userId, reason);
            if (!result.ok) toast.error(result.error);
            else router.refresh();
          });
        }}
      >
        {banned ? "解封" : "封禁"}
      </button>
    </span>
  );
}
