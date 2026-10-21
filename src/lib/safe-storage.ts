/**
 * localStorage that never throws. Private modes, blocked third-party
 * storage and quota errors all make the raw API throw — inside an effect
 * that reaches the route's error boundary and blanks the page, a poor
 * trade for a remembered preference. Reads degrade to null, writes to
 * no-ops.
 */
export const safeStorage = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  },
};
