import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type CardProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
