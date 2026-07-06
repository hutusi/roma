import type { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-form";

export const metadata: Metadata = { title: "找回密码", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-sm animate-fade-up px-6 pt-20">
      <ForgotPasswordForm />
    </div>
  );
}
