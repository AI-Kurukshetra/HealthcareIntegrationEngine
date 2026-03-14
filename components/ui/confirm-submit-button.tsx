"use client";

import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

interface ConfirmSubmitButtonProps extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  confirmMessage: string;
}

export function ConfirmSubmitButton({
  children,
  className,
  confirmMessage,
  onClick,
  type = "submit",
  ...props
}: ConfirmSubmitButtonProps) {
  return (
    <button
      type={type}
      className={cn(className)}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
          return;
        }

        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
