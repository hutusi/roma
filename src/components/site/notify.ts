"use client";

import { toasterReady } from "./toaster-ready";

/**
 * Toasts for public islands. sonner loads on first use instead of
 * shipping in every page's initial chunk, and each toast waits until the
 * <Toaster> it reports to (LazyToaster, once per root layout) is mounted:
 * sonner drops a toast published before then. Best effort: if sonner
 * itself fails to load, the toast is skipped rather than thrown.
 */
const whenReady = () => Promise.all([import("sonner"), toasterReady]).then(([{ toast }]) => toast);

export function notifyError(message: string) {
  whenReady()
    .then((toast) => toast.error(message))
    .catch(() => {});
}

export function notifySuccess(message: string) {
  whenReady()
    .then((toast) => toast.success(message))
    .catch(() => {});
}
