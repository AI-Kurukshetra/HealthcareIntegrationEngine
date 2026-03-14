"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { loginAction } from "@/lib/auth/actions";
import { initialFormState } from "@/lib/auth/form-state";
import { Card } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, action] = useActionState(loginAction, initialFormState);

  return (
    <Card className="w-full max-w-md border-[var(--line-strong)]">
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Healthcare Integration</p>
        <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
        <p className="text-sm text-slate-600">Use your credentials to access operations, monitoring, and logs.</p>
      </div>

      <form action={action} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />

        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="ops@hospital.com"
            defaultValue={state.values?.email ?? ""}
            required
          />
        </Field>

        <Field>
          <FieldLabel>Password</FieldLabel>
          <Input name="password" type="password" autoComplete="current-password" required />
        </Field>

        <FieldError>{state.error}</FieldError>
        <AuthSubmitButton idleLabel="Sign in" pendingLabel="Signing in..." />
      </form>

      <p className="mt-6 border-t border-[var(--line)] pt-4 text-sm text-slate-600">
        Need an account?{" "}
        <Link href="/signup" className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4">
          Create one
        </Link>
      </p>
    </Card>
  );
}
