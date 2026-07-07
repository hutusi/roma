"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { saveDirector } from "@/actions/directors";
import {
  directorFormSchema,
  type DirectorFormValues,
} from "@/lib/validators/director";
import { TiptapEditor, type MediaOption } from "@/components/tiptap/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nameZh">中文名</Label>
          <Input id="nameZh" {...register("nameZh")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="slug">slug *</Label>
        <Input id="slug" placeholder="federico-fellini" {...register("slug")} />
        {errors.slug && (
          <p className="text-xs text-destructive">{errors.slug.message}</p>
        )}
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
      <Button type="submit" disabled={submitting} className="tracking-[0.2em]">
        {submitting ? "保存中…" : "保存"}
      </Button>
    </form>
  );
}
