/**
 * A reorder must be a COMPLETE permutation of the collection's current
 * item ids. Rewriting only the ids it was handed leaves the omitted rows
 * on stale positions that collide with the ones just assigned, and
 * `position` carries no unique constraint to catch it — the order just
 * silently corrupts.
 *
 * Both curated lists and user lists reorder the same way, so the rule
 * lives here rather than being restated in each action: a gate copied
 * into two places is how the director publish gate drifted.
 *
 * Ids belonging to another list are already inert (every reorder scopes
 * its UPDATE by the parent id), so they surface here as "unknown" rather
 * than as a cross-list write.
 *
 * Returns null when the input is a valid permutation, else a short
 * machine-readable reason — the caller maps it to its own message.
 */
export type PermutationProblem = "duplicate" | "incomplete" | "unknown";

export function permutationProblem(
  orderedItemIds: readonly string[],
  currentIds: readonly string[],
): PermutationProblem | null {
  const seen = new Set(orderedItemIds);
  if (seen.size !== orderedItemIds.length) return "duplicate";
  if (seen.size !== currentIds.length) return "incomplete";
  return currentIds.every((id) => seen.has(id)) ? null : "unknown";
}
