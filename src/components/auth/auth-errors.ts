import type { Dictionary } from "@/i18n/dictionaries/zh";

type AuthErrors = Dictionary["auth"]["errors"];

/** better-auth's client error shape (the parts we read). */
export type AuthClientError = { code?: string; status?: number; message?: string } | null;

/**
 * A better-auth failure as a sentence in the reader's language. Its own
 * `message` is English and meant for developers, so it is never shown —
 * that put "User already exists. Use another email." on /zh. Codes map to
 * dictionary copy; anything unrecognised gets the generic line.
 */
export function authErrorMessage(error: AuthClientError, labels: AuthErrors): string {
  const code = error?.code ?? "";
  if (error?.status === 429) return labels.rateLimited;
  if (code === "INVALID_EMAIL_OR_PASSWORD" || code === "INVALID_USERNAME_OR_PASSWORD") {
    return labels.invalidCredentials;
  }
  if (code === "INVALID_PASSWORD") return labels.wrongPassword;
  if (code.startsWith("USER_ALREADY_EXISTS")) return labels.emailTaken;
  if (code.startsWith("USERNAME_IS_ALREADY_TAKEN")) return labels.usernameTaken;
  if (code.startsWith("USERNAME_TOO") || code === "INVALID_USERNAME") return labels.usernameInvalid;
  if (code === "PASSWORD_TOO_SHORT") return labels.passwordTooShort;
  if (code === "PASSWORD_TOO_LONG") return labels.passwordTooLong;
  if (code === "INVALID_EMAIL") return labels.invalidEmail;
  if (code === "INVALID_TOKEN" || code === "TOKEN_EXPIRED") return labels.tokenExpired;
  if (code === "BANNED_USER") return labels.banned;
  return labels.unknown;
}
