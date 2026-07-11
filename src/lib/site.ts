/**
 * Canonical origin for metadata, sitemap, and OG URLs. `||` on purpose:
 * an env pull can leave the var set to "", and `new URL("")` throws.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://babuban.com";
