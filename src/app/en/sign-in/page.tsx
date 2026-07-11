import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getDict } from "@/i18n/dict";

export const metadata: Metadata = { title: "Sign in" };

export default function EnSignInPage() {
  return (
    <div className="mx-auto max-w-sm animate-fade-up px-6 pt-20">
      <Suspense>
        <SignInForm locale="en" labels={getDict("en").auth} />
      </Suspense>
    </div>
  );
}
