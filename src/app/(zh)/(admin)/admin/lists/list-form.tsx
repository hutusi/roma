"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { saveListMeta } from "@/actions/lists";
import { type MediaOption, TiptapEditor } from "@/components/tiptap/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ListFormValues, listFormSchema } from "@/lib/validators/list";

export function ListForm({
  listId,
  defaultValues,
  media,
}: {
  listId: string | null;
  defaultValues: ListFormValues;
  media: MediaOption[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ListFormValues>({
    resolver: zodResolver(listFormSchema),
    defaultValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    const result = await saveListMeta(listId, values);
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("已保存");
    if (!listId) router.push(`/admin/lists/${result.data.id}`);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-5">
      <div className="grid grid-cols-[2fr_1fr_auto] gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">标题 *</Label>
          <Input id="title" {...register("title")} />
          {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">slug *</Label>
          <Input id="slug" placeholder="postwar-italy" {...register("slug")} />
          {errors.slug && <p className="text-destructive text-xs">{errors.slug.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sortOrder">排序值</Label>
          <Input id="sortOrder" type="number" className="w-20" {...register("sortOrder")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="theme">主题一句话</Label>
        <Input id="theme" placeholder="战后意大利：废墟上的凝视" {...register("theme")} />
      </div>
      <div className="space-y-1.5">
        <Label>引言</Label>
        <Controller
          control={control}
          name="intro"
          render={({ field }) => (
            <TiptapEditor
              value={field.value as Record<string, unknown> | null}
              onChange={field.onChange}
              media={media}
              placeholder="这份片单为什么存在…"
            />
          )}
        />
      </div>
      <section className="space-y-5 border-line border-t pt-5">
        <h2 className="font-bold">英文版 · English Edition</h2>
        <p className="text-ink-muted text-xs">
          发布英文版需要英文标题；未翻译的影片在英文页降级为不可点击的条目。
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="titleEn">英文标题 · Title</Label>
            <Input id="titleEn" {...register("titleEn")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="themeEn">英文主题 · Theme</Label>
            <Input id="themeEn" {...register("themeEn")} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>英文引言 · Intro</Label>
          <Controller
            control={control}
            name="introEn"
            render={({ field }) => (
              <TiptapEditor
                value={field.value as Record<string, unknown> | null}
                onChange={field.onChange}
                media={media}
                placeholder="Why this list exists…"
              />
            )}
          />
        </div>
      </section>
      <Button type="submit" disabled={submitting} className="tracking-[0.2em]">
        {submitting ? "保存中…" : "保存"}
      </Button>
    </form>
  );
}
