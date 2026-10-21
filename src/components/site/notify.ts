"use client";

/**
 * Error toasts for public islands. sonner loads on first use instead of
 * shipping in every page's initial chunk; the <Toaster> it reports to is
 * mounted once per root layout (LazyToaster).
 */
export function notifyError(message: string) {
  void import("sonner").then(({ toast }) => toast.error(message));
}

export function notifySuccess(message: string) {
  void import("sonner").then(({ toast }) => toast.success(message));
}
