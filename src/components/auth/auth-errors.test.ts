import { describe, expect, test } from "bun:test";
import { en } from "@/i18n/dictionaries/en";
import { zh } from "@/i18n/dictionaries/zh";
import { authErrorMessage } from "./auth-errors";

describe("authErrorMessage", () => {
  const z = zh.auth.errors;
  test.each([
    [{ code: "INVALID_EMAIL_OR_PASSWORD", status: 401 }, z.invalidCredentials],
    [{ code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL", status: 422 }, z.emailTaken],
    [{ code: "USERNAME_IS_ALREADY_TAKEN_PLEASE_TRY_ANOTHER", status: 422 }, z.usernameTaken],
    [{ code: "USERNAME_TOO_SHORT", status: 422 }, z.usernameInvalid],
    [{ code: "PASSWORD_TOO_SHORT", status: 400 }, z.passwordTooShort],
    [{ code: "INVALID_PASSWORD", status: 400 }, z.wrongPassword],
    [{ code: "INVALID_TOKEN", status: 400 }, z.tokenExpired],
    [{ code: "BANNED_USER", status: 403 }, z.banned],
    [{ status: 429 }, z.rateLimited],
    [{ code: "SOMETHING_NEW", status: 500, message: "Internal" }, z.unknown],
    [null, z.unknown],
  ])("%o → its own sentence", (error, expected) => {
    expect(authErrorMessage(error, z)).toBe(expected);
  });

  test("never echoes better-auth's English message", () => {
    const message = "User already exists. Use another email.";
    expect(authErrorMessage({ code: "WHATEVER", message }, en.auth.errors)).not.toContain(message);
  });
});
