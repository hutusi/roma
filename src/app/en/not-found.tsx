import Link from "next/link";

/**
 * The en root layout already wraps pages in the site chrome, so unlike
 * the zh not-found this renders only the body. It also serves the
 * subset rule: films without a published English edition 404 here.
 */
export default function EnNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-display text-ink-muted text-sm uppercase tracking-[0.4em]">404</p>
      <h1 className="mt-4 font-bold text-3xl tracking-[0.2em]">Lost to time</h1>
      <p className="mt-4 max-w-[44ch] text-ink-muted leading-[1.9]">
        The page you are looking for does not exist — or, like many silent films, its English
        edition has not been preserved yet.
      </p>
      <Link
        href="/en"
        className="mt-8 border border-ink px-8 py-3 text-sm tracking-[0.3em] transition-colors hover:border-brand hover:text-brand"
      >
        Back to the home page
      </Link>
    </div>
  );
}
