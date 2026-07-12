import { isLocale } from "@/i18n/locales";

/**
 * Reset-password email template. `locale` is the raw stored value — it
 * crosses a trust boundary (DB column read through a better-auth cast),
 * so it's narrowed here: anything but a valid Locale gets the
 * launch-era bilingual template (pre-column accounts have NULL). Pure
 * so the body is unit-testable; e2e can only observe the reset URL.
 */
export function buildResetEmail(
  locale: string | null | undefined,
  url: string,
): { subject: string; text: string } {
  if (locale != null && isLocale(locale)) {
    if (locale === "zh") {
      return {
        subject: "八部半 · 重置密码",
        text: `你好，\n\n点击以下链接重置密码（1 小时内有效）：\n${url}\n\n如果这不是你的操作，请忽略这封邮件。\n\n—— 八部半 babuban.com`,
      };
    }
    return {
      subject: "Babuban · Reset your password",
      text: `Hello,\n\nClick the link below to reset your password (valid for 1 hour):\n${url}\n\nIf you didn't request this, you can safely ignore this email.\n\n— Babuban babuban.com`,
    };
  }
  return {
    subject: "八部半 · 重置密码 / Babuban · Reset your password",
    text: `你好，\n\n点击以下链接重置密码（1 小时内有效）：\n${url}\n\n如果这不是你的操作，请忽略这封邮件。\n\nHello,\n\nUse the link above to reset your password (valid for 1 hour).\nIf you didn't request this, you can safely ignore this email.\n\n—— 八部半 babuban.com`,
  };
}
