import type { PropsWithChildren } from "react";

export function Field({ children }: PropsWithChildren) {
  return <label className="grid gap-2.5">{children}</label>;
}

export function FieldLabel({ children }: PropsWithChildren) {
  return <span className="text-sm font-semibold text-[var(--text-muted)]">{children}</span>;
}

export function FieldError({ children }: PropsWithChildren) {
  if (!children) {
    return null;
  }

  return <p className="text-sm text-rose-600">{children}</p>;
}
