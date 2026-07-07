import { desc } from "drizzle-orm";
import { db } from "@/db";
import { invitations } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-guards";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InviteControls, InviteCreateForm } from "./invite-controls";

export const metadata = { title: "编辑邀请" };

export default async function AdminInvitesPage() {
  await requireAdmin();
  const rows = await db.query.invitations.findMany({
    orderBy: desc(invitations.createdAt),
    with: { inviter: { columns: { name: true } } },
  });

  const statusOf = (invite: (typeof rows)[number]) => {
    if (invite.acceptedAt) return "已接受";
    if (invite.expiresAt < new Date()) return "已过期";
    return "待接受";
  };

  return (
    <div>
      <h1 className="text-xl font-bold">邀请客座编辑</h1>
      <div className="mt-6 max-w-xl">
        <InviteCreateForm />
      </div>
      <Table className="mt-8">
        <TableHeader>
          <TableRow>
            <TableHead>邮箱</TableHead>
            <TableHead>角色</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>邀请人</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((invite) => (
            <TableRow key={invite.id}>
              <TableCell className="font-medium">{invite.email}</TableCell>
              <TableCell>{invite.role === "admin" ? "管理员" : "编辑"}</TableCell>
              <TableCell className="text-ink-muted">{statusOf(invite)}</TableCell>
              <TableCell className="text-ink-muted">
                {invite.inviter?.name ?? "—"}
              </TableCell>
              <TableCell>
                <InviteControls
                  inviteId={invite.id}
                  token={invite.token}
                  active={statusOf(invite) === "待接受"}
                />
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-ink-muted">
                还没有邀请
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
