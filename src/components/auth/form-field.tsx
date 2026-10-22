import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Dictionary } from "@/i18n/dictionaries/zh";

/**
 * Label, input and its message, wired for assistive tech: the message is
 * the input's description and marks it invalid. Forms set noValidate and
 * fill `error` from fieldErrors() below, so validation speaks the page's
 * language instead of the browser's.
 */
export function FormField({
  id,
  label,
  error,
  hint,
  ...input
}: ComponentProps<typeof Input> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...input}
      />
      {error ? (
        <p id={`${id}-error`} className="text-destructive text-sm">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-ink-muted text-xs">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/**
 * The browser's constraint checks (required, type, pattern, minLength),
 * reported in our words. Returns one message per invalid field and
 * focuses the first; an empty object means the form may submit.
 */
export function fieldErrors(
  form: HTMLFormElement,
  labels: Dictionary["auth"]["errors"],
): Record<string, string> {
  const errors: Record<string, string> = {};
  let first: HTMLInputElement | null = null;
  for (const el of Array.from(form.elements)) {
    if (!(el instanceof HTMLInputElement) || !el.name || el.validity.valid) continue;
    const v = el.validity;
    errors[el.name] = v.valueMissing
      ? labels.required
      : v.typeMismatch
        ? labels.invalidEmail
        : v.patternMismatch
          ? labels.usernameInvalid
          : v.tooShort
            ? labels.passwordTooShort
            : labels.unknown;
    first ??= el;
  }
  first?.focus();
  return errors;
}
