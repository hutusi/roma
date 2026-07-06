import { requireEditor } from "@/lib/auth-guards";

export const metadata = { title: "预览" };

/**
 * Placeholder until the public presentational components land (M3);
 * preview then renders drafts through exactly those components.
 */
export default async function PreviewStubPage() {
  await requireEditor();
  return (
    <div className="py-20 text-center text-ink-muted">
      <p>预览功能将随公开页面一起上线。</p>
    </div>
  );
}
