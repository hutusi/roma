/**
 * Settles once the page's <Toaster> has mounted and subscribed; the
 * shared Toaster (ui/sonner) signals it, in both root layouts. sonner
 * hands each toast only to current subscribers and never replays one, and
 * the public Toaster loads lazily (LazyToaster), so a toast raised before
 * it arrived (a fast failure on a slow connection) used to vanish.
 * notify.ts waits on this instead.
 */
let markReady: () => void = () => {};
export const toasterReady = new Promise<void>((resolve) => {
  markReady = resolve;
});
export const markToasterReady = () => markReady();
