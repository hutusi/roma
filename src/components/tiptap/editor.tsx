"use client";

import { Placeholder } from "@tiptap/extensions";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { essayExtensions } from "./extensions";

export type MediaOption = { id: string; url: string; alt: string | null };

function ToolbarButton({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "rounded px-2 py-1 text-sm transition-colors hover:bg-accent",
        active && "bg-accent font-bold text-brand",
      )}
    >
      {children}
    </button>
  );
}

function ImagePicker({ editor, media }: { editor: Editor; media: MediaOption[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          title="插入图片"
          className="rounded px-2 py-1 text-sm transition-colors hover:bg-accent"
        >
          图
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>从媒体库插入图片</DialogTitle>
        </DialogHeader>
        {media.length === 0 ? (
          <p className="text-ink-muted text-sm">媒体库为空——请先在「媒体库」上传图片。</p>
        ) : (
          <div className="grid max-h-80 grid-cols-4 gap-2 overflow-y-auto">
            {media.map((m) => (
              <button
                key={m.id}
                type="button"
                className="relative aspect-[137/100] cursor-pointer transition-opacity hover:opacity-75"
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .setImage({ src: m.url, alt: m.alt ?? undefined })
                    .run();
                  setOpen(false);
                }}
              >
                <Image src={m.url} alt={m.alt ?? ""} fill sizes="160px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function TiptapEditor({
  value,
  onChange,
  placeholder,
  media = [],
  className,
}: {
  value: Record<string, unknown> | null | undefined;
  onChange: (doc: Record<string, unknown>) => void;
  placeholder?: string;
  media?: MediaOption[];
  className?: string;
}) {
  const editor = useEditor({
    extensions: [
      ...essayExtensions,
      Placeholder.configure({ placeholder: placeholder ?? "开始写作…" }),
    ],
    content: value ?? undefined,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-32 px-3 py-2 focus:outline-none font-body",
      },
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

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("链接地址（留空移除）", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    if (!/^https?:\/\//.test(url)) return;
    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className={cn("border border-line bg-card", className)}>
      <div className="flex flex-wrap gap-0.5 border-line border-b px-1 py-1">
        <ToolbarButton
          title="加粗"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          粗
        </ToolbarButton>
        <ToolbarButton
          title="斜体"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          斜
        </ToolbarButton>
        <ToolbarButton
          title="二级标题"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          title="三级标题"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          title="引用"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          引
        </ToolbarButton>
        <ToolbarButton
          title="无序列表"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </ToolbarButton>
        <ToolbarButton
          title="有序列表"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </ToolbarButton>
        <ToolbarButton title="链接" active={editor.isActive("link")} onClick={setLink}>
          链
        </ToolbarButton>
        <ImagePicker editor={editor} media={media} />
        <div className="ml-auto flex gap-0.5">
          <ToolbarButton title="撤销" onClick={() => editor.chain().focus().undo().run()}>
            ↺
          </ToolbarButton>
          <ToolbarButton title="重做" onClick={() => editor.chain().focus().redo().run()}>
            ↻
          </ToolbarButton>
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

export function NoteCounter({ text }: { text: string }) {
  const len = Array.from(text).length;
  const inRange = len >= 200 && len <= 500;
  return (
    <p className={cn("text-right text-xs", inRange ? "text-ink-muted" : "text-destructive")}>
      {len} / 200–500 字
    </p>
  );
}

/** English notes measure in words (see EDITORIAL_NOTE_EN_* in the validator). */
export function NoteCounterEn({ text }: { text: string }) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const inRange = words >= 120 && words <= 350;
  return (
    <p className={cn("text-right text-xs", inRange ? "text-ink-muted" : "text-destructive")}>
      {words} / 120–350 词
    </p>
  );
}
