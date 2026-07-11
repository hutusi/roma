"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createInvite, revokeInvite } from "@/actions/invites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InviteCreateForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "admin">("editor");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await createInvite(email, role);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          const url = `${window.location.origin}/invite/${result.data.token}`;
          let copied = true;
          try {
            await navigator.clipboard.writeText(url);
          } catch {
            copied = false;
          }
          // Don't claim "已复制" when the clipboard write failed; surface
          // the link so the invite is still usable.
          if (copied) {
            toast.success("邀请已创建，链接已复制到剪贴板", { duration: 6000 });
          } else {
            toast.success("邀请已创建", { description: url, duration: 10000 });
          }
          setEmail("");
          router.refresh();
        });
      }}
    >
      <Input
        type="email"
        placeholder="受邀人邮箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <select
        className="h-9 border border-input bg-transparent px-2 text-sm"
        value={role}
        onChange={(e) => setRole(e.target.value as "editor" | "admin")}
      >
        <option value="editor">编辑</option>
        <option value="admin">管理员</option>
      </select>
      <Button type="submit" disabled={pending}>
        {pending ? "创建中…" : "创建邀请"}
      </Button>
    </form>
  );
}

export function InviteControls({
  inviteId,
  token,
  active,
}: {
  inviteId: string;
  token: string;
  active: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <span className="flex gap-3 text-xs">
      {active && (
        <button
          type="button"
          className="text-brand hover:underline"
          onClick={async () => {
            const url = `${window.location.origin}/invite/${token}`;
            try {
              await navigator.clipboard.writeText(url);
              toast.success("链接已复制");
            } catch {
              window.prompt("复制失败，请手动复制：", url);
            }
          }}
        >
          复制链接
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        className="text-ink-muted hover:text-destructive"
        onClick={() =>
          startTransition(async () => {
            const result = await revokeInvite(inviteId);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            router.refresh();
          })
        }
      >
        撤销
      </button>
    </span>
  );
}
