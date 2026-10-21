import { localePath } from "@/i18n/locales";

const LINK = "whitespace-nowrap text-brand text-sm hover:underline";

/**
 * The edit page's way out to what readers see: draft previews of both
 * editions, and — once an edition is live — the public page itself. All
 * open in a new tab, so checking the page never costs the editor the
 * form (or a trip through the unsaved-changes guard).
 */
export function EditorLinks({
  previewHref,
  publicPath,
  published,
  publishedEn,
}: {
  /** The admin preview route; `?locale=en` is appended for EN. */
  previewHref: string;
  /** The locale-less public path, e.g. /film/slug (compose via localePath). */
  publicPath: string;
  published: boolean;
  publishedEn: boolean;
}) {
  const external = { target: "_blank", rel: "noopener" } as const;
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <a href={previewHref} className={LINK} {...external}>
        预览 ↗
      </a>
      <a href={`${previewHref}?locale=en`} className={LINK} {...external}>
        EN 预览 ↗
      </a>
      {published && (
        <a href={localePath("zh", publicPath)} className={LINK} {...external}>
          前台页面 ↗
        </a>
      )}
      {published && publishedEn && (
        <a href={localePath("en", publicPath)} className={LINK} {...external}>
          EN 前台 ↗
        </a>
      )}
    </span>
  );
}
