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
