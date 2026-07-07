import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, username } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  appName: "八部半",
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      // Resend in production; in dev (no key) the URL lands in the
      // server log so the flow stays testable without credentials. In
      // production a missing key must fail loudly — never log a live
      // reset token there.
      if (!process.env.RESEND_API_KEY) {
        // E2E_ALLOW_LOG_RESET is set only by the Playwright webServer so
        // the reset loop stays testable against a production build. It
        // is additionally bound to a localhost origin so a copy-pasted
        // env file can't disable the production guard on a real host.
        const e2eEscape =
          process.env.E2E_ALLOW_LOG_RESET &&
          process.env.BETTER_AUTH_URL?.startsWith("http://localhost");
        if (process.env.NODE_ENV === "production" && !e2eEscape) {
          throw new Error("RESEND_API_KEY is not configured");
        }
        console.log(`[dev] password reset for ${user.email}: ${url}`);
        if (process.env.E2E_ALLOW_LOG_RESET) {
          const { appendFile, mkdir } = await import("node:fs/promises");
          await mkdir("e2e/.auth", { recursive: true });
          await appendFile("e2e/.auth/reset-urls.log", `${user.email} ${url}\n`);
        }
        return;
      }
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? "八部半 <noreply@babuban.com>",
          to: user.email,
          subject: "八部半 · 重置密码",
          text: `你好，\n\n点击以下链接重置密码（1 小时内有效）：\n${url}\n\n如果这不是你的操作，请忽略这封邮件。\n\n—— 八部半 babuban.com`,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        throw new Error(`Resend responded ${response.status}: ${await response.text()}`);
      }
    },
  },
  plugins: [
    admin({ defaultRole: "user", adminRoles: ["admin"] }),
    username(),
    // Must stay last: it patches cookie handling for server actions.
    nextCookies(),
  ],
});
