import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getDict } from "@/i18n/dict";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default function EnResetPasswordPage() {
  return (
    <div className="mx-auto max-w-sm animate-fade-up px-6 pt-20">
      <Suspense>
        <ResetPasswordForm locale="en" labels={getDict("en").auth} />
      </Suspense>
    </div>
  );
}
