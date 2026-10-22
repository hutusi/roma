"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createInvite, revokeInvite } from "@/actions/invites";
import { callAction, notifyActionError } from "@/components/admin/action-client";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { localePath } from "@/i18n/locales";

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
          const result = await callAction(() => createInvite(email, role));
          if (!result.ok) {
            notifyActionError(result.error);
            return;
          }
          const url = `${window.location.origin}${localePath("zh", `/invite/${result.data.token}`)}`;
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
  accepted,
}: {
  inviteId: string;
  token: string;
  active: boolean;
  /** An accepted invitation is the record of how an editor joined: not revocable. */
  accepted: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Set when the clipboard refuses (insecure origin, denied permission):
  // the link is shown, selected, for a manual copy — not in a prompt().
  const [manualUrl, setManualUrl] = useState<string | null>(null);

  return (
    <span className="flex flex-wrap items-center gap-3 text-xs">
      {active && (
        <button
          type="button"
          className="text-brand hover:underline"
          onClick={async () => {
            const url = `${window.location.origin}${localePath("zh", `/invite/${token}`)}`;
            try {
              await navigator.clipboard.writeText(url);
              setManualUrl(null);
              toast.success("链接已复制");
            } catch {
              setManualUrl(url);
              toast.message("无法自动复制，请手动复制显示的链接");
            }
          }}
        >
          复制链接
        </button>
      )}
      {active && manualUrl && (
        <input
          readOnly
          value={manualUrl}
          aria-label="邀请链接"
          // biome-ignore lint/a11y/noAutofocus: shown in response to the click, to be copied at once.
          autoFocus
          onFocus={(e) => e.currentTarget.select()}
          className="h-7 w-64 border border-line-strong bg-transparent px-2"
        />
      )}
      {!accepted && (
        <ConfirmButton
          size="xs"
          variant="ghost"
          disabled={pending}
          className="h-auto px-0 text-ink-muted hover:text-destructive"
          title="撤销这份邀请？"
          description="邀请链接会立即失效。"
          confirmLabel="撤销"
          onConfirm={() =>
            startTransition(async () => {
              const result = await callAction(() => revokeInvite(inviteId));
              if (!result.ok) {
                notifyActionError(result.error);
                return;
              }
              toast.success("邀请已撤销");
              router.refresh();
            })
          }
        >
          撤销
        </ConfirmButton>
      )}
    </span>
  );
}
