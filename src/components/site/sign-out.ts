"use client";

import { invalidateMe } from "@/components/site/use-me";

/**
 * Signs out through better-auth's client — loaded only now, so it stays
 * out of the layout chunk — and clears the shared session store. Returns
 * whether it worked; callers toast on false and refresh on true.
 */
export async function signOut(): Promise<boolean> {
  try {
    const { authClient } = await import("@/lib/auth-client");
    const { error } = await authClient.signOut();
    if (error) return false;
  } catch {
    return false;
  }
  invalidateMe();
  return true;
}
