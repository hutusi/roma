import Link from "next/link";
import { notFound } from "next/navigation";
import { PersonPage } from "@/components/person/person-page";
import { getPersonForPreview } from "@/db/queries/public";
import { requireEditor } from "@/lib/auth-guards";

export const metadata = { title: "预览人物" };

export default async function PersonPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ locale?: string }>;
}) {
  await requireEditor();
  const { id } = await params;
  const { locale: localeParam } = await searchParams;
  const locale = localeParam === "en" ? "en" : "zh";
  // Locale must reach normalization too, or the en preview keeps films
  // the published /en page hides.
  const person = await getPersonForPreview(id, locale);
  if (!person) notFound();

  return (
    <div>
      <p className="border-line border-b pb-3 text-ink-muted text-sm">
        草稿预览（读者视角，与公开页使用同一组件）
        {locale === "en" && " · 英文版"} ·{" "}
        <Link href={`/admin/people/${id}`} className="text-brand hover:underline">
          返回编辑
        </Link>
      </p>
      <PersonPage person={person} locale={locale} />
    </div>
  );
}
