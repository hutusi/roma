import type { Metadata } from "next";
import { FollowsPage } from "@/components/user/follows-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "关注的片单",
  robots: { index: false },
};

export default function Page() {
  return <FollowsPage />;
}
