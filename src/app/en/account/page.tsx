import type { Metadata } from "next";
import { AccountPage } from "@/components/user/account-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account settings",
  robots: { index: false },
};

export default function Page() {
  return <AccountPage locale="en" />;
}
