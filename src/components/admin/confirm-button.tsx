"use client";

import { type ComponentProps, type ReactNode, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * A button that asks first, in the page's own dialog rather than the
 * browser's window.confirm/prompt (unstyled, blocking, easy to dismiss by
 * reflex, and impossible to explain consequences in). `reason` adds an
 * optional text field whose value is passed to onConfirm — for a ban,
 * say.
 */
export function ConfirmButton({
  title,
  description,
  confirmLabel,
  onConfirm,
  reason,
  destructive = true,
  children,
  ...button
}: Omit<ComponentProps<typeof Button>, "onClick"> & {
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  onConfirm: (reason: string) => void;
  reason?: { label: string; placeholder?: string };
  destructive?: boolean;
}) {
  const [text, setText] = useState("");
  return (
    <AlertDialog onOpenChange={(open) => open && setText("")}>
      <AlertDialogTrigger asChild>
        <Button {...button}>{children}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="font-sans">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        {reason && (
          <div className="space-y-1.5">
            <Label htmlFor="confirm-reason">{reason.label}</Label>
            <Input
              id="confirm-reason"
              value={text}
              placeholder={reason.placeholder}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            variant={destructive ? "destructive" : "default"}
            onClick={() => onConfirm(text)}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
