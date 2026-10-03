"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/action";

type Props = {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  submit?: string;
  className?: string;
  reset?: boolean;
  variant?: "primary" | "secondary" | "danger";
  confirm?: string;
  inline?: boolean;
};

export function ActionForm({ action, children, submit = "Save", className, reset = true, variant, confirm, inline }: Props) {
  const [state, formAction] = useActionState(action, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && reset) ref.current?.reset();
  }, [state, reset]);
  return (
    <form
      ref={ref}
      action={formAction}
      className={className ?? (inline ? "inline-flex items-center gap-2" : "space-y-3")}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {children}
      <div className={inline ? "inline-flex items-center gap-2" : "flex items-center gap-3"}>
        <SubmitButton label={submit} variant={variant} small={inline} />
        {state?.error && <span className="text-sm text-bad">{state.error}</span>}
        {!inline && state?.ok && <span className="text-sm text-ok">{state.ok}</span>}
      </div>
    </form>
  );
}

function SubmitButton({ label, variant = "primary", small }: { label: string; variant?: string; small?: boolean }) {
  const { pending } = useFormStatus();
  const styles =
    variant === "danger"
      ? "bg-bad text-white"
      : variant === "secondary"
        ? "bg-white border border-line text-ink"
        : "bg-brand text-brand-ink";
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${styles} ${small ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm"} rounded-md font-medium disabled:opacity-50`}
    >
      {pending ? "…" : label}
    </button>
  );
}
