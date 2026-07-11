import { TitleCard } from "@/components/site/title-card";
import { getDict } from "@/i18n/dict";
import type { Locale } from "@/i18n/locales";
import { requireUser } from "@/lib/auth-guards";
import { AccountForm } from "./account-form";

/** Account settings, rendered for both locales; the form chrome is localized. */
export async function AccountPage({ locale = "zh" }: { locale?: Locale }) {
  const dict = getDict(locale);
  const session = await requireUser(locale);
  return (
    <div className="mx-auto max-w-md animate-fade-up px-6 pt-16">
      <TitleCard eyebrow="Account" title={dict.account.settings} />
      <AccountForm
        name={session.user.name}
        username={(session.user as { username?: string | null }).username ?? ""}
        email={session.user.email}
        labels={dict.account}
      />
    </div>
  );
}
