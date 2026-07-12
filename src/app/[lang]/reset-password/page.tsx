import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getDict } from "@/i18n/dict";

export const metadata: Metadata = { title: "重置密码", robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-sm animate-fade-up px-6 pt-20">
      <Suspense>
        <ResetPasswordForm locale="zh" labels={getDict("zh").auth} />
      </Suspense>
    </div>
  );
}
