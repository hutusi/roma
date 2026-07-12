import type { Metadata } from "next";
import { AccountPage } from "@/components/user/account-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "账号设置",
  robots: { index: false },
};

export default function Page() {
  return <AccountPage />;
}
