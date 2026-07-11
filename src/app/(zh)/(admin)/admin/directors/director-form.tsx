"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { saveDirector } from "@/actions/directors";
import { type MediaOption, TiptapEditor } from "@/components/tiptap/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type DirectorFormValues, directorFormSchema } from "@/lib/validators/director";

export function DirectorForm({
  directorId,
  defaultValues,
  media,
}: {
  directorId: string | null;
  defaultValues: DirectorFormValues;
  media: MediaOption[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DirectorFormValues>({
    resolver: zodResolver(directorFormSchema),
    defaultValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    const result = await saveDirector(directorId, values);
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("已保存");
    if (!directorId) router.push(`/admin/directors/${result.data.id}`);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">姓名（原文）*</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nameZh">中文名</Label>
          <Input id="nameZh" {...register("nameZh")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="slug">slug *</Label>
        <Input id="slug" placeholder="federico-fellini" {...register("slug")} />
        {errors.slug && <p className="text-destructive text-xs">{errors.slug.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bio">简介（纯文本）</Label>
        <Textarea id="bio" rows={4} {...register("bio")} className="font-body" />
      </div>
      <div className="space-y-1.5">
        <Label>创作历程</Label>
        <Controller
          control={control}
          name="careerEssay"
          render={({ field }) => (
            <TiptapEditor
              value={field.value as Record<string, unknown> | null}
              onChange={field.onChange}
              media={media}
              placeholder="从早期作品谈起…"
            />
          )}
        />
      </div>
      <section className="space-y-5 border-line border-t pt-5">
        <h2 className="font-bold">英文版 · English Edition</h2>
        <p className="text-ink-muted text-xs">发布英文版需要英文简介；英文页只显示英文内容。</p>
        <div className="space-y-1.5">
          <Label htmlFor="bioEn">英文简介 · Bio</Label>
          <Textarea id="bioEn" rows={4} {...register("bioEn")} />
        </div>
        <div className="space-y-1.5">
          <Label>英文创作历程（可选）· Career essay</Label>
          <Controller
            control={control}
            name="careerEssayEn"
            render={({ field }) => (
              <TiptapEditor
                value={field.value as Record<string, unknown> | null}
                onChange={field.onChange}
                media={media}
                placeholder="Starting from the early work…"
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
