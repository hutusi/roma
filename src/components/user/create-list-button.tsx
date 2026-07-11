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
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { type Locale, localePath } from "@/i18n/locales";

export function CreateListButton({
  username,
  locale,
  labels,
}: {
  username: string;
  locale: Locale;
  labels: Dictionary["userList"];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full tracking-[0.2em]">
          {labels.newList}
        </Button>
      </DialogTrigger>
      <DialogContent className="font-sans">
        <DialogHeader>
          <DialogTitle>{labels.newList}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            startTransition(async () => {
              const result = await createUserList(
                {
                  title: String(form.get("title")),
                  description: String(form.get("description") || ""),
                },
                locale,
              );
              if (!result.ok) {
                setError(labels.errors[result.error as keyof typeof labels.errors] ?? result.error);
                return;
              }
              setOpen(false);
              router.push(localePath(locale, `/u/${username}/list/${result.data.id}`));
            });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="title">{labels.titleLabel}</Label>
            <Input id="title" name="title" required maxLength={60} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">{labels.introLabel}</Label>
            <Input id="description" name="description" maxLength={140} />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? labels.creating : labels.create}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
