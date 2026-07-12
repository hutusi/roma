import { describe, expect, test } from "bun:test";
import { buildResetEmail } from "./reset-email";

const url = "https://babuban.com/api/auth/reset-password/tok?callbackURL=%2Fzh%2Freset-password";

describe("buildResetEmail", () => {
  test("zh locale gets a Chinese-only email", () => {
    const { subject, text } = buildResetEmail("zh", url);
    expect(subject).toBe("八部半 · 重置密码");
    expect(text).toContain(url);
    expect(text).toContain("你好");
    expect(text).not.toContain("Hello");
    expect(text).not.toContain("reset your password");
  });

  test("en locale gets an English-only email", () => {
    const { subject, text } = buildResetEmail("en", url);
    expect(subject).toBe("Babuban · Reset your password");
    expect(text).toContain(url);
    expect(text).toContain("Hello");
    // No CJK prose leaks into the en email.
    expect(text).not.toMatch(/[一-鿿]/);
  });

  test.each([null, undefined, "fr", ""])("unknown locale %p falls back to bilingual", (locale) => {
    const { subject, text } = buildResetEmail(locale as string | null | undefined, url);
    expect(subject).toBe("八部半 · 重置密码 / Babuban · Reset your password");
    expect(text).toContain(url);
    expect(text).toContain("你好");
    expect(text).toContain("Hello");
  });

  test("the codename never reaches an email", () => {
    for (const locale of ["zh", "en", null]) {
      const { subject, text } = buildResetEmail(locale, url);
      expect(`${subject}\n${text}`.toLowerCase()).not.toContain("roma");
    }
  });
});
