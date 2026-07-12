import type { Instrumentation } from "next";

/**
 * Central server-error seam. Next funnels every uncaught server error —
 * RSC render, Route Handlers, Server Actions, Proxy — through this hook,
 * so it's the one place to observe and forward production failures. Until
 * this existed, errors only reached scattered console.error calls (or were
 * swallowed by the dev overlay), with no route context and nothing to
 * forward.
 *
 * v1 emits one structured JSON line per error, greppable and parseable in
 * Vercel runtime logs, and is the single integration point for a tracker
 * (Sentry/OTel) when one is wired — forward from here rather than
 * sprinkling capture() calls across handlers. Deliberately server-side
 * only: a browser SDK is unreachable from mainland China (ADR 0002), so
 * client-side capture is out of scope.
 */
export const onRequestError: Instrumentation.onRequestError = (err, request, context) => {
  // `err` is unknown and — for Server Component render errors — may be a
  // React-processed wrapper, so read `digest` defensively and lean on it
  // to correlate with the client-facing error id.
  const digest =
    typeof err === "object" && err !== null && "digest" in err
      ? String((err as { digest: unknown }).digest)
      : undefined;

  console.error(
    JSON.stringify({
      level: "error",
      event: "request_error",
      message: err instanceof Error ? err.message : String(err),
      digest,
      method: request.method,
      path: request.path,
      routePath: context.routePath,
      routeType: context.routeType,
      stack: err instanceof Error ? err.stack : undefined,
    }),
  );
};
