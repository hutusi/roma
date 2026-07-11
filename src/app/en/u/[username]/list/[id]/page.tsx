import type { Metadata } from "next";
import { UserListPage } from "@/components/user/user-list-page";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { robots: { index: false } };
}

export default async function Page({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}) {
  const { username, id } = await params;
  return <UserListPage username={username} id={id} locale="en" />;
}
