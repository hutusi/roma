"use client";

import { Placeholder } from "@tiptap/extensions";
import { type Editor, EditorContent, useEditor, useEditorState } from "@tiptap/react";
import {
  BoldIcon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  type LucideIcon,
  QuoteIcon,
  Redo2Icon,
  Undo2Icon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  codePointLength,
  EDITORIAL_NOTE_EN_MAX,
  EDITORIAL_NOTE_MAX,
  INTRODUCTION_EN_MAX,
  INTRODUCTION_EN_MIN,
  INTRODUCTION_MAX,
  INTRODUCTION_MIN,
  wordCount,
} from "@/lib/validators/film";
import { essayExtensions } from "./extensions";
import { isAllowedLinkHref } from "./link-policy";

export type MediaOption = { id: string; url: string; alt: string | null; credit: string };

/**
 * Icon buttons, each named for screen readers and hover (the old glyphs
 * — 粗, 斜, 引, •, 链, 图 — were guessable at best), and toggles report
 * their state with aria-pressed rather than colour alone.
 */
function ToolbarButton({
  icon: Icon,
  label,
  pressed,
  disabled,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  /** Set for toggles (bold, lists…); omitted for one-shot commands. */
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      // Keep the editor's selection: a mousedown here would blur it first.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="inline-flex size-8 items-center justify-center rounded text-ink-muted transition-colors hover:bg-accent hover:text-ink disabled:pointer-events-none disabled:opacity-40 aria-pressed:bg-accent aria-pressed:text-brand"
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}

const Divider = () => <span aria-hidden className="mx-1 h-5 w-px self-center bg-line" />;

/**
 * Adds, edits or removes a link, in the page's own dialog — window.prompt
 * gave no way to say why an address was refused, so a rejected link
 * (say "www.example.com") simply didn't happen. With nothing selected,
 * the address itself is inserted as the link text.
 */
function LinkDialog({
  editor,
  open,
  onOpenChange,
}: {
  editor: Editor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const id = useId();
  const existing = editor.getAttributes("link").href as string | undefined;
  const [href, setHref] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [openedFor, setOpenedFor] = useState(false);
  if (open !== openedFor) {
    setOpenedFor(open);
    if (open) {
      setHref(existing ?? "https://");
      setError(null);
    }
  }

  const apply = () => {
    const value = href.trim();
    if (value === "" || value === "https://") {
      if (existing) editor.chain().focus().extendMarkRange("link").unsetLink().run();
      onOpenChange(false);
      return;
    }
    if (!isAllowedLinkHref(value)) {
      setError("只支持 https:// 、http:// 或 mailto: 开头的地址");
      return;
    }
    const chain = editor.chain().focus().extendMarkRange("link");
    if (editor.state.selection.empty && !existing) {
      chain
        .insertContent({
          type: "text",
          text: value,
          marks: [{ type: "link", attrs: { href: value } }],
        })
        .run();
    } else {
      chain.setLink({ href: value }).run();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md font-sans" closeLabel="关闭">
        <DialogHeader>
          <DialogTitle>{existing ? "编辑链接" : "添加链接"}</DialogTitle>
          <DialogDescription>
            {editor.state.selection.empty && !existing
              ? "未选中文字：将直接插入这个地址。"
              : "链接加在选中的文字上。"}
          </DialogDescription>
        </DialogHeader>
        {/* The dialog portals out of the DOM form, but React events still
            bubble to it — stop the submit before it saves the whole form. */}
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            apply();
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-href`}>地址</Label>
            <Input
              id={`${id}-href`}
              value={href}
              autoFocus
              inputMode="url"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(e) => {
                setHref(e.target.value);
                setError(null);
              }}
            />
            {error && (
              <p id={`${id}-error`} role="alert" className="text-destructive text-xs">
                {error}
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            {existing ? (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive"
                onClick={() => {
                  editor.chain().focus().extendMarkRange("link").unsetLink().run();
                  onOpenChange(false);
                }}
              >
                移除链接
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit">{existing ? "更新" : "添加"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const matches = (m: MediaOption, q: string) =>
  [m.alt ?? "", m.credit, decodeURIComponent(m.url.split("/").pop() ?? "")]
    .join(" ")
    .toLowerCase()
    .includes(q);

/**
 * Picks an image from the media library, then asks for its alt text
 * before inserting — prefilled with the library's, since an essay image
 * often wants a description of what it shows in this context. Search
 * covers alt text, credit and file name.
 */
function ImagePicker({
  editor,
  media,
  open,
  onOpenChange,
}: {
  editor: Editor;
  media: MediaOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState<MediaOption | null>(null);
  const [alt, setAlt] = useState("");
  const [openedFor, setOpenedFor] = useState(false);
  if (open !== openedFor) {
    setOpenedFor(open);
    if (open) {
      setQuery("");
      setChosen(null);
    }
  }

  const q = query.trim().toLowerCase();
  const shown = q ? media.filter((m) => matches(m, q)) : media;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl font-sans" closeLabel="关闭">
        <DialogHeader>
          <DialogTitle>{chosen ? "图片说明" : "从媒体库插入图片"}</DialogTitle>
          <DialogDescription>
            {chosen
              ? "替代文字描述画面内容，供读屏软件和图片加载失败时使用。"
              : "图片来源会按媒体库中的署名显示在图下。"}
          </DialogDescription>
        </DialogHeader>
        {chosen ? (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor
                .chain()
                .focus()
                .setImage({ src: chosen.url, alt: alt.trim() || undefined })
                .run();
              onOpenChange(false);
            }}
            className="space-y-4"
          >
            <div className="flex gap-4">
              <div className="relative aspect-[137/100] w-40 shrink-0 bg-ink">
                <Image src={chosen.url} alt="" fill sizes="160px" className="object-contain" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <Label htmlFor={`${id}-alt`}>替代文字</Label>
                <Input
                  id={`${id}-alt`}
                  value={alt}
                  autoFocus
                  placeholder="例：吉尔索米娜在海边回头"
                  onChange={(e) => setAlt(e.target.value)}
                />
                <p className="text-ink-muted text-xs">来源：{chosen.credit}</p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setChosen(null)}>
                ← 换一张
              </Button>
              <Button type="submit">插入</Button>
            </DialogFooter>
          </form>
        ) : media.length === 0 ? (
          <p className="text-ink-muted text-sm">
            媒体库为空——
            <a
              href="/admin/media"
              target="_blank"
              rel="noopener"
              className="text-brand hover:underline"
            >
              去媒体库上传 ↗
            </a>
            ，再回到这里插入。
          </p>
        ) : (
          <div className="space-y-3">
            <Input
              type="search"
              value={query}
              autoFocus
              aria-label="搜索图片"
              placeholder="按说明、来源或文件名搜索"
              onChange={(e) => setQuery(e.target.value)}
              // Enter would otherwise submit the editor's form.
              onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            />
            {shown.length === 0 ? (
              <p className="py-8 text-center text-ink-muted text-sm">
                没有匹配「{query.trim()}」的图片。
              </p>
            ) : (
              <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
                {shown.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    title={m.alt ?? m.credit}
                    className="relative aspect-[137/100] cursor-pointer bg-ink transition-opacity hover:opacity-75 focus-visible:ring-2 focus-visible:ring-brand"
                    onClick={() => {
                      setChosen(m);
                      setAlt(m.alt ?? "");
                    }}
                  >
                    <Image
                      src={m.url}
                      alt={m.alt ?? ""}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            <p className="text-ink-muted text-xs">
              显示最近上传的 {media.length} 张 ·{" "}
              <a
                href="/admin/media"
                target="_blank"
                rel="noopener"
                className="text-brand hover:underline"
              >
                媒体库 ↗
              </a>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * The document as plain JSON. ProseMirror builds node and mark attrs with
 * Object.create(null) and getJSON() hands them through, but a server
 * action only accepts plain objects: React passes a null-prototype object
 * as an opaque temporary reference, and the save validator's
 * structuredClone then threw on it. So any essay with a heading, list,
 * link or image failed to save from the admin ("操作没有完成"), while
 * plain paragraphs (no attrs) went through.
 */
const plainJson = (doc: Record<string, unknown>): Record<string, unknown> =>
  JSON.parse(JSON.stringify(doc));

const INACTIVE = {
  bold: false,
  italic: false,
  h2: false,
  h3: false,
  quote: false,
  bullet: false,
  ordered: false,
  link: false,
  canUndo: false,
  canRedo: false,
};

export function TiptapEditor({
  value,
  onChange,
  placeholder,
  media,
  className,
  "aria-label": ariaLabel,
}: {
  value: Record<string, unknown> | null | undefined;
  onChange: (doc: Record<string, unknown>) => void;
  placeholder?: string;
  /** The image picker's library; without it the editor offers no images. */
  media?: MediaOption[];
  className?: string;
  /** Names the editable region (it has no <label> of its own). */
  "aria-label"?: string;
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const editor = useEditor({
    extensions: [
      ...essayExtensions,
      Placeholder.configure({ placeholder: placeholder ?? "开始写作…" }),
    ],
    content: value ?? undefined,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(plainJson(editor.getJSON())),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-32 px-3 py-2 focus:outline-none font-body",
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
      },
    },
  });

  // Toolbar state follows the selection, not just the content: the editor
  // doesn't re-render on transactions, so isActive() read during render
  // went stale as soon as the cursor moved without typing.
  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor && {
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        h2: editor.isActive("heading", { level: 2 }),
        h3: editor.isActive("heading", { level: 3 }),
        quote: editor.isActive("blockquote"),
        bullet: editor.isActive("bulletList"),
        ordered: editor.isActive("orderedList"),
        link: editor.isActive("link"),
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
      },
  });

  // Keep a remounted form (e.g. after reset) in sync without loops.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `value` is deliberately omitted — this must run only when the editor instance appears, or every keystroke would reset the cursor.
  useEffect(() => {
    if (editor && value && editor.isEmpty) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor]);

  if (!editor) {
    return <div className={cn("min-h-40 border border-line", className)} />;
  }
  // The state store may still hold its pre-editor snapshot (null) until
  // the first transaction; render with nothing active until then.
  const active = state ?? INACTIVE;

  const run = (command: (chain: ReturnType<Editor["chain"]>) => ReturnType<Editor["chain"]>) =>
    command(editor.chain().focus()).run();

  return (
    <div className={cn("border border-line-strong bg-card focus-within:border-ink", className)}>
      <div
        role="toolbar"
        // Named per editor: a form holds several, each with its own toolbar.
        aria-label={`${ariaLabel ?? "正文"} · 格式`}
        className="flex flex-wrap items-center gap-0.5 border-line border-b px-1 py-1"
      >
        <ToolbarButton
          icon={BoldIcon}
          label="加粗"
          pressed={active.bold}
          onClick={() => run((c) => c.toggleBold())}
        />
        <ToolbarButton
          icon={ItalicIcon}
          label="斜体"
          pressed={active.italic}
          onClick={() => run((c) => c.toggleItalic())}
        />
        <Divider />
        <ToolbarButton
          icon={Heading2Icon}
          label="二级标题"
          pressed={active.h2}
          onClick={() => run((c) => c.toggleHeading({ level: 2 }))}
        />
        <ToolbarButton
          icon={Heading3Icon}
          label="三级标题"
          pressed={active.h3}
          onClick={() => run((c) => c.toggleHeading({ level: 3 }))}
        />
        <ToolbarButton
          icon={QuoteIcon}
          label="引用"
          pressed={active.quote}
          onClick={() => run((c) => c.toggleBlockquote())}
        />
        <ToolbarButton
          icon={ListIcon}
          label="无序列表"
          pressed={active.bullet}
          onClick={() => run((c) => c.toggleBulletList())}
        />
        <ToolbarButton
          icon={ListOrderedIcon}
          label="有序列表"
          pressed={active.ordered}
          onClick={() => run((c) => c.toggleOrderedList())}
        />
        <Divider />
        <ToolbarButton
          icon={LinkIcon}
          label={active.link ? "编辑链接" : "链接"}
          pressed={active.link}
          onClick={() => setLinkOpen(true)}
        />
        {media && (
          <ToolbarButton icon={ImageIcon} label="插入图片" onClick={() => setImageOpen(true)} />
        )}
        <div className="ml-auto flex gap-0.5">
          <ToolbarButton
            icon={Undo2Icon}
            label="撤销"
            disabled={!active.canUndo}
            onClick={() => run((c) => c.undo())}
          />
          <ToolbarButton
            icon={Redo2Icon}
            label="重做"
            disabled={!active.canRedo}
            onClick={() => run((c) => c.redo())}
          />
        </div>
      </div>
      <EditorContent editor={editor} />
      <LinkDialog editor={editor} open={linkOpen} onOpenChange={setLinkOpen} />
      {media && (
        <ImagePicker editor={editor} media={media} open={imageOpen} onOpenChange={setImageOpen} />
      )}
    </div>
  );
}

/**
 * 影片介绍 — a range, so the counter reads as progress toward a band.
 * Bounds come from the validator rather than being repeated here: they
 * were hardcoded once and silently described the wrong field after the
 * introduction and the note were split.
 */
export function IntroCounter({ text }: { text: string }) {
  // Trimmed, because the publish gates are: publishProblems measures
  // introduction.trim(), so counting raw text let 200 leading spaces read as
  // in-range right up until submission rejected them.
  const len = codePointLength(text.trim());
  // Empty is "not started", not an error: a new draft opened in red.
  const ok = len === 0 || (len >= INTRODUCTION_MIN && len <= INTRODUCTION_MAX);
  return (
    <p className={cn("text-right text-xs", ok ? "text-ink-muted" : "text-destructive")}>
      {len} / {INTRODUCTION_MIN}–{INTRODUCTION_MAX} 字
    </p>
  );
}

/** English introductions measure in words, not code points. */
export function IntroCounterEn({ text }: { text: string }) {
  const words = wordCount(text.trim());
  const ok = words === 0 || (words >= INTRODUCTION_EN_MIN && words <= INTRODUCTION_EN_MAX);
  return (
    <p className={cn("text-right text-xs", ok ? "text-ink-muted" : "text-destructive")}>
      {words} / {INTRODUCTION_EN_MIN}–{INTRODUCTION_EN_MAX} 词
    </p>
  );
}

/**
 * 编辑札记 — a ceiling with no floor, so this counts down rather than up.
 * An empty note is valid and must not read as an error; the number only
 * turns red once it is over.
 */
export function CeilingCounter({ text, en = false }: { text: string; en?: boolean }) {
  const trimmed = text.trim();
  const used = en ? wordCount(trimmed) : codePointLength(trimmed);
  const max = en ? EDITORIAL_NOTE_EN_MAX : EDITORIAL_NOTE_MAX;
  const unit = en ? "词" : "字";
  return (
    <p className={cn("text-right text-xs", used <= max ? "text-ink-muted" : "text-destructive")}>
      {used > max ? `超出 ${used - max} ${unit}` : `${used} / ${max} ${unit}（选填）`}
    </p>
  );
}

/**
 * 人物介绍 / bioEn — required, no hard cap, but its opening doubles as the
 * meta description, so the counter marks where that cut falls instead of
 * implying a limit. Counts what the slice counts (UTF-16 units).
 */
export function SummaryCounter({ text, max }: { text: string; max: number }) {
  const len = text.trim().length;
  return (
    <p className="text-right text-ink-muted text-xs">
      {len === 0
        ? "发布前需填写"
        : len <= max
          ? `${len} 字符 · 全部用作摘要`
          : `${len} 字符 · 摘要只取前 ${max} 字符`}
    </p>
  );
}
