import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getDict } from "@/i18n/dict";

export const metadata: Metadata = { title: "登录" };

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-sm animate-fade-up px-6 pt-20">
      <Suspense>
        <SignInForm locale="zh" labels={getDict("zh").auth} />
      </Suspense>
    </div>
  );
}
