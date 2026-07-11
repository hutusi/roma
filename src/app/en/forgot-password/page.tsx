import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getDict } from "@/i18n/dict";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };

export default function EnForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-sm animate-fade-up px-6 pt-20">
      <ForgotPasswordForm locale="en" labels={getDict("en").auth} />
    </div>
  );
}
