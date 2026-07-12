import { headers } from "next/headers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-guards";
import { UserRowControls } from "./user-row-controls";

export const metadata = { title: "用户管理" };

export default async function AdminUsersPage() {
  const session = await requireAdmin();
  const { users } = await auth.api.listUsers({
    query: { limit: 200, sortBy: "createdAt", sortDirection: "desc" },
    headers: await headers(),
  });

  return (
    <div>
      <h1 className="font-bold text-xl">用户</h1>
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>用户</TableHead>
            <TableHead>邮箱</TableHead>
            <TableHead>角色</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>注册时间</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.name}
                {"username" in user && user.username ? (
                  <span className="ml-2 text-ink-muted text-xs">@{String(user.username)}</span>
                ) : null}
              </TableCell>
              <TableCell className="text-ink-muted">{user.email}</TableCell>
              <TableCell>
                <UserRowControls
                  userId={user.id}
                  role={(user.role as string) ?? "user"}
                  banned={Boolean(user.banned)}
                  isSelf={user.id === session.user.id}
                />
              </TableCell>
              <TableCell className="text-ink-muted">
                {user.banned ? `已封禁${user.banReason ? `（${user.banReason}）` : ""}` : "正常"}
              </TableCell>
              <TableCell className="text-ink-muted">
                {new Date(user.createdAt).toLocaleDateString("zh-CN")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
