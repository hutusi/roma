"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createUserList } from "@/actions/user-lists";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateListButton({ username }: { username: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full tracking-[0.2em]">
          新建片单
        </Button>
      </DialogTrigger>
      <DialogContent className="font-sans">
        <DialogHeader>
          <DialogTitle>新建片单</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            startTransition(async () => {
              const result = await createUserList({
                title: String(form.get("title")),
                description: String(form.get("description") || ""),
              });
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setOpen(false);
              router.push(`/u/${username}/list/${result.data.id}`);
            });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="title">标题</Label>
            <Input id="title" name="title" required maxLength={60} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">简介（可选）</Label>
            <Input id="description" name="description" maxLength={140} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "创建中…" : "创建"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
