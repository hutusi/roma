export type PersonUrlRole = "director" | "actor";

/**
 * Canonical locale-less path for a person; compose with localePath().
 * primaryRole picks the segment — the other segment 308s here, so every
 * person link must be built through this helper rather than a hardcoded
 * /director prefix.
 */
export function personPath(p: { slug: string; primaryRole: PersonUrlRole }): string {
  return `/${p.primaryRole === "actor" ? "actor" : "director"}/${p.slug}`;
}
