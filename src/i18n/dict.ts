import "server-only";
import { en } from "./dictionaries/en";
import { type Dictionary, zh } from "./dictionaries/zh";
import type { Locale } from "./locales";

/**
 * Server-only on purpose: pages pass translated strings to client
 * islands as props, so no dictionary bytes reach the client bundle.
 */
export function getDict(locale: Locale): Dictionary {
  return locale === "en" ? en : zh;
}
