"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AuthSubmitButtonProps {
  idleLabel: string;
  pendingLabel: string;
  className?: string;
}

export function AuthSubmitButton({ idleLabel, pendingLabel, className }: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className={cn("w-full", className)} disabled={pending}>
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
