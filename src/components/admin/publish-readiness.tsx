/**
 * What still stands between a draft and publishing, per edition — the
 * same checks the publish action runs (src/lib/validators), shown before
 * the click instead of as one long joined toast after it. They run on
 * the SAVED row, as the action does, so unsaved edits don't count yet.
 */
export function PublishReadiness({
  editions,
}: {
  editions: { label: string; published: boolean; problems: string[] }[];
}) {
  const pending = editions.filter((e) => !e.published);
  if (pending.length === 0) return null;
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {pending.map((edition) => (
        <div key={edition.label} className="border border-line bg-card px-4 py-3 text-sm">
          <p className="font-bold">
            {edition.label}
            {edition.problems.length === 0 ? (
              <span className="ml-2 font-normal text-ink-muted">可以发布 ✓</span>
            ) : (
              <span className="ml-2 font-normal text-ink-muted">发布前还需：</span>
            )}
          </p>
          {edition.problems.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-muted">
              {edition.problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
      <p className="text-ink-muted text-xs sm:col-span-2">按已保存的内容检查——先保存，再发布。</p>
    </div>
  );
}
