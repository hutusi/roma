/**
 * Server actions return results instead of throwing: Next.js masks
 * thrown error messages in production, and validation feedback must
 * reach the editor verbatim.
 */
export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { ok: false; error: string };

export const ok = <T>(data?: T) => ({ ok: true as const, data: data as T });
export const fail = (error: string) => ({ ok: false as const, error });

/**
 * The first value of `key` along an error's cause chain. Drizzle wraps
 * every failed query in a DrizzleQueryError and keeps node-postgres's
 * error, the one carrying the SQLSTATE and constraint name, on `cause`;
 * checking only the outer error never matched.
 */
function fromCauseChain(error: unknown, key: "code" | "constraint"): string | undefined {
  let current = error;
  for (let depth = 0; depth < 5 && typeof current === "object" && current !== null; depth++) {
    const value = (current as Record<string, unknown>)[key];
    if (typeof value === "string") return value;
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}

/** The Postgres SQLSTATE behind an error, if there is one. */
export const pgCode = (error: unknown) => fromCauseChain(error, "code");
/** The violated constraint's name, for errors that have one. */
export const pgConstraint = (error: unknown) => fromCauseChain(error, "constraint") ?? "";

/** 23505: a row the action meant to create already exists. */
export const isUniqueViolation = (error: unknown) => pgCode(error) === "23505";
/** 23503: the action referenced a row that is gone (or never was). */
export const isForeignKeyViolation = (error: unknown) => pgCode(error) === "23503";
