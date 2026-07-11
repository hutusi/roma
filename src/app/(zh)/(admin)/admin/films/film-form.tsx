"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { saveFilm } from "@/actions/films";
import { importFromTmdb } from "@/actions/tmdb";
import {
  type MediaOption,
  NoteCounter,
  NoteCounterEn,
  TiptapEditor,
} from "@/components/tiptap/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type FilmFormValues, filmFormSchema } from "@/lib/validators/film";

export type DirectorOption = { id: string; name: string; nameZh: string | null };

const ASPECT_RATIOS = ["1.37:1", "1.33:1", "1.66:1", "1.85:1", "2.35:1"];
const REGIONS = [
  { value: "CN", label: "大陆" },
  { value: "HK", label: "香港" },
  { value: "TW", label: "台湾" },
  { value: "INTL", label: "海外" },
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-line border-t pt-6">
      <h2 className="mb-4 font-bold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function FilmForm({
  filmId,
  defaultValues,
  directors,
  media,
  tmdbEnabled = false,
}: {
  filmId: string | null;
  defaultValues: FilmFormValues;
  directors: DirectorOption[];
  media: MediaOption[];
  tmdbEnabled?: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<FilmFormValues>({
    resolver: zodResolver(filmFormSchema),
    defaultValues,
  });
  const castArray = useFieldArray({ control, name: "cast" });
  const linksArray = useFieldArray({ control, name: "watchLinks" });
  const note = watch("editorialNote") ?? "";
  const noteEn = watch("editorialNoteEn") ?? "";

  const onSubmit = handleSubmit(
    async (values) => {
      setSubmitting(true);
      const result = await saveFilm(filmId, values);
      setSubmitting(false);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("已保存");
      if (!filmId) router.push(`/admin/films/${result.data.id}`);
      router.refresh();
    },
    // Some fields (array rows, selects) may lack inline error slots;
    // never let a blocked submit look like a dead button.
    () => toast.error("表单有未通过校验的字段，请检查标红项"),
  );

  const fieldError = (message?: string) =>
    message ? <p className="text-destructive text-xs">{message}</p> : null;

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6 pb-24">
      {tmdbEnabled && !filmId && (
        <div className="border border-line bg-card p-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={async () => {
              const id = window.prompt("TMDB 影片 ID（数字）");
              if (!id) return;
              const result = await importFromTmdb(id);
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              const d = result.data;
              reset({
                ...getValues(),
                titleZh: d.titleZh ?? getValues("titleZh"),
                titleZhHk: d.titleZhHk ?? "",
                titleZhTw: d.titleZhTw ?? "",
                titleOriginal: d.titleOriginal,
                titleEn: d.titleEn ?? "",
                year: d.year ?? getValues("year"),
                runtimeMinutes: d.runtimeMinutes ?? "",
                countries: d.countries,
                cast: d.cast.map((m) => ({ ...m, zhName: "" })),
              });
              toast.success("已从 TMDB 预填，请核对并补写编辑札记");
            }}
          >
            从 TMDB 导入元数据
          </Button>
          <span className="ml-3 text-ink-muted text-xs">
            仅预填资料，不导入图片；札记始终手写。
          </span>
        </div>
      )}
      <Section title="译名与原名">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="titleZh">大陆译名 *</Label>
            <Input id="titleZh" {...register("titleZh")} />
            {fieldError(errors.titleZh?.message)}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="titleOriginal">原名 *</Label>
            <Input id="titleOriginal" {...register("titleOriginal")} />
            {fieldError(errors.titleOriginal?.message)}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="titleZhHk">港译</Label>
            <Input id="titleZhHk" {...register("titleZhHk")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="titleZhTw">台译</Label>
            <Input id="titleZhTw" {...register("titleZhTw")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="titleEn">英文名</Label>
            <Input id="titleEn" {...register("titleEn")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">slug *</Label>
            <Input id="slug" placeholder="otto-e-mezzo" {...register("slug")} />
            {fieldError(errors.slug?.message)}
          </div>
        </div>
      </Section>

      <Section title="基本信息">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="year">年份 *</Label>
            <Input id="year" type="number" {...register("year")} />
            {fieldError(errors.year?.message)}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="runtimeMinutes">片长（分钟）</Label>
            <Input id="runtimeMinutes" type="number" {...register("runtimeMinutes")} />
            {fieldError(errors.runtimeMinutes?.message)}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="aspectRatio">画幅</Label>
            <Input
              id="aspectRatio"
              list="aspect-ratios"
              placeholder="1.37:1"
              {...register("aspectRatio")}
            />
            <datalist id="aspect-ratios">
              {ASPECT_RATIOS.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="countries">国家/地区（顿号或逗号分隔）</Label>
            <Input id="countries" placeholder="意大利、法国" {...register("countries")} />
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" {...register("isBlackAndWhite")} />
            黑白片
          </label>
        </div>
        <div className="space-y-1.5">
          <Label>导演 *</Label>
          <Controller
            control={control}
            name="directorIds"
            render={({ field }) => (
              <div className="flex flex-wrap gap-3 border border-line bg-card p-3">
                {directors.length === 0 && (
                  <p className="text-ink-muted text-sm">还没有导演条目——请先在「导演」中创建。</p>
                )}
                {directors.map((d) => (
                  <label key={d.id} className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={field.value.includes(d.id)}
                      onChange={(e) =>
                        field.onChange(
                          e.target.checked
                            ? [...field.value, d.id]
                            : field.value.filter((id) => id !== d.id),
                        )
                      }
                    />
                    {d.nameZh ?? d.name}
                  </label>
                ))}
              </div>
            )}
          />
        </div>
      </Section>

      <Section title="编辑札记（发布需 200–500 字）">
        <Textarea rows={8} {...register("editorialNote")} className="font-body leading-relaxed" />
        <NoteCounter text={note} />
        {fieldError(errors.editorialNote?.message)}
      </Section>

      <Section title="长文（可选）">
        <Controller
          control={control}
          name="essay"
          render={({ field }) => (
            <TiptapEditor
              value={field.value as Record<string, unknown> | null}
              onChange={field.onChange}
              media={media}
              placeholder="关于这部影片，还有更多想说的…"
            />
          )}
        />
      </Section>

      <Section title="英文版 · English Edition">
        <p className="text-ink-muted text-xs">
          发布英文版需要英文名与 120–350 词英文札记；英文页只显示英文内容，不回退中文。
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="editorialNoteEn">英文札记 · Editorial note</Label>
          <Textarea id="editorialNoteEn" rows={8} {...register("editorialNoteEn")} />
          <NoteCounterEn text={noteEn} />
          {fieldError(errors.editorialNoteEn?.message)}
        </div>
        <div className="space-y-1.5">
          <Label>英文长文（可选）· Essay</Label>
          <Controller
            control={control}
            name="essayEn"
            render={({ field }) => (
              <TiptapEditor
                value={field.value as Record<string, unknown> | null}
                onChange={field.onChange}
                media={media}
                placeholder="More to say about this film…"
              />
            )}
          />
        </div>
      </Section>

      <Section title="演员表">
        {castArray.fields.map((field, i) => (
          <div key={field.id}>
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
              <Input placeholder="姓名（原文）" {...register(`cast.${i}.name`)} />
              <Input placeholder="中文名" {...register(`cast.${i}.zhName`)} />
              <Input placeholder="角色" {...register(`cast.${i}.character`)} />
              <Button type="button" variant="ghost" onClick={() => castArray.remove(i)}>
                删除
              </Button>
            </div>
            {fieldError(errors.cast?.[i]?.name?.message)}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => castArray.append({ name: "", zhName: "", character: "" })}
        >
          添加演员
        </Button>
      </Section>

      <Section title="哪里能看">
        {linksArray.fields.map((field, i) => (
          <div key={field.id}>
            <div className="grid grid-cols-[1fr_auto_2fr_1fr_1fr_auto] gap-2">
              <Input placeholder="平台" {...register(`watchLinks.${i}.platform`)} />
              <select
                className="h-9 border border-input bg-transparent px-2 text-sm"
                {...register(`watchLinks.${i}.region`)}
              >
                {REGIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <Input placeholder="链接（可选）" {...register(`watchLinks.${i}.url`)} />
              <Input placeholder="备注" {...register(`watchLinks.${i}.note`)} />
              <Input placeholder="英文备注" {...register(`watchLinks.${i}.noteEn`)} />
              <Button type="button" variant="ghost" onClick={() => linksArray.remove(i)}>
                删除
              </Button>
            </div>
            {fieldError(
              errors.watchLinks?.[i]?.platform?.message ?? errors.watchLinks?.[i]?.url?.message,
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            linksArray.append({ platform: "", region: "CN", url: "", note: "", noteEn: "" })
          }
        >
          添加观看渠道
        </Button>
      </Section>

      <div className="fixed inset-x-0 bottom-0 border-line border-t bg-paper/95 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-end gap-3 px-8">
          <Button type="submit" disabled={submitting} className="tracking-[0.2em]">
            {submitting ? "保存中…" : "保存"}
          </Button>
        </div>
      </div>
    </form>
  );
}
