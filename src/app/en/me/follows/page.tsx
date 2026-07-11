import type { Metadata } from "next";
import { FollowsPage } from "@/components/user/follows-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Followed lists",
  robots: { index: false },
};

export default function Page() {
  return <FollowsPage locale="en" />;
}
