"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { savePerson } from "@/actions/people";
import { callAction, notifyActionError } from "@/components/admin/action-client";
import { useDirtyGuard } from "@/components/admin/dirty-guard";
import { SaveBar } from "@/components/admin/save-bar";
import { CeilingCounter, type MediaOption, TiptapEditor } from "@/components/tiptap/editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type PersonFormValues, personFormSchema } from "@/lib/validators/person";

export function PersonForm({
  personId,
  revision = 0,
  defaultValues,
  media,
}: {
  personId: string | null;
  /** The revision this form loaded; a stale save is refused (optimistic concurrency). */
  revision?: number;
  defaultValues: PersonFormValues;
  media: MediaOption[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<PersonFormValues>({
    resolver: zodResolver(personFormSchema),
    defaultValues,
  });
  const revisionRef = useRef(revision);
  // Unsaved edits ask before navigation; a save in flight doesn't count.
  useDirtyGuard("person-form", isDirty && !submitting);
  const note = watch("editorialNote") ?? "";
  const noteEn = watch("editorialNoteEn") ?? "";

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    const result = await callAction(() => savePerson(personId, values, revisionRef.current));
    setSubmitting(false);
    if (!result.ok) {
      notifyActionError(result.error);
      return;
    }
    revisionRef.current = result.data.revision;
    // Saved values become the new baseline, so the form reads clean.
    reset(values);
    setSavedAt(new Date());
    toast.success("已保存");
    if (!personId) router.push(`/admin/people/${result.data.id}`);
    router.refresh();
  });

  return (
    <form id="person-form" onSubmit={onSubmit} className="max-w-3xl space-y-5">
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
        <Label>类型（决定公开页地址：/director 或 /actor）</Label>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input type="radio" value="director" {...register("primaryRole")} />
            导演
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" value="actor" {...register("primaryRole")} />
            演员
          </label>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bio">人物介绍（纯文本）</Label>
        <p className="text-ink-muted text-xs">
          中性、可查证，一两句为宜。这段同时用作卡片摘要与页面 meta 描述（截取前 160
          字），所以不要写长——篇幅放在创作历程里。
        </p>
        <Textarea id="bio" rows={4} {...register("bio")} className="font-body" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="editorialNote">编辑札记（选填，至多 400 字）</Label>
        <p className="text-ink-muted text-xs">你自己的看法，一两句就够，不填也可以发布。</p>
        <Textarea
          id="editorialNote"
          rows={3}
          {...register("editorialNote")}
          className="font-body"
        />
        <CeilingCounter text={note} />
        {errors.editorialNote?.message && (
          <p className="text-destructive text-xs">{errors.editorialNote.message}</p>
        )}
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
              aria-label="创作历程"
            />
          )}
        />
      </div>
      <section className="space-y-5 border-line border-t pt-5">
        <h2 className="font-bold">英文版 · English Edition</h2>
        <p className="text-ink-muted text-xs">发布英文版需要英文简介；英文页只显示英文内容。</p>
        <div className="space-y-1.5">
          <Label htmlFor="bioEn">英文介绍 · Introduction</Label>
          <Textarea id="bioEn" rows={4} {...register("bioEn")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="editorialNoteEn">英文札记 · Editorial note（选填）</Label>
          <Textarea id="editorialNoteEn" rows={3} {...register("editorialNoteEn")} />
          <CeilingCounter text={noteEn} en />
          {errors.editorialNoteEn?.message && (
            <p className="text-destructive text-xs">{errors.editorialNoteEn.message}</p>
          )}
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
                aria-label="英文创作历程"
              />
            )}
          />
        </div>
      </section>
      <SaveBar formId="person-form" dirty={isDirty} submitting={submitting} savedAt={savedAt} />
    </form>
  );
}
