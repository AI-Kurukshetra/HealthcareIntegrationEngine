"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Card } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signupAction } from "@/lib/auth/actions";
import { initialFormState } from "@/lib/auth/form-state";

export function SignupForm() {
  const [state, action] = useActionState(signupAction, initialFormState);

  return (
    <Card className="w-full max-w-md border-[var(--line-strong)]">
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Healthcare Integration</p>
        <h1 className="text-2xl font-semibold text-slate-900">Create your workspace</h1>
        <p className="text-sm text-slate-600">Register your first admin and bootstrap the first organization workspace.</p>
      </div>

      <form action={action} className="space-y-4">
        <Field>
          <FieldLabel>Full name</FieldLabel>
          <Input name="fullName" placeholder="Alex Johnson" defaultValue={state.values?.fullName ?? ""} required />
        </Field>

        <Field>
          <FieldLabel>Organization name</FieldLabel>
          <Input
            name="organizationName"
            placeholder="Northwind Hospital"
            defaultValue={state.values?.organizationName ?? ""}
            required
          />
        </Field>

        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="admin@northwindhealth.com"
            defaultValue={state.values?.email ?? ""}
            required
          />
        </Field>

        <Field>
          <FieldLabel>Password</FieldLabel>
          <Input name="password" type="password" autoComplete="new-password" required />
        </Field>

        <FieldError>{state.error}</FieldError>
        <AuthSubmitButton idleLabel="Create account" pendingLabel="Creating account..." />
      </form>

      <p className="mt-6 border-t border-[var(--line)] pt-4 text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
