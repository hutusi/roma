import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { getDict } from "@/i18n/dict";

export const metadata: Metadata = { title: "Sign up" };

export default function EnSignUpPage() {
  return (
    <div className="mx-auto max-w-sm animate-fade-up px-6 pt-20">
      <SignUpForm locale="en" labels={getDict("en").auth} />
    </div>
  );
}
