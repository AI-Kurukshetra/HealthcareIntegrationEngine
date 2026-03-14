"use client";

import { useActionState } from "react";

import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Card } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createOrganizationAction } from "@/lib/auth/actions";
import { initialFormState } from "@/lib/auth/form-state";

export function OrganizationOnboardingForm() {
  const [state, action] = useActionState(createOrganizationAction, initialFormState);

  return (
    <Card className="w-full max-w-md border-[var(--line-strong)]">
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Organization Setup</p>
        <h1 className="text-2xl font-semibold text-slate-900">Finish onboarding</h1>
        <p className="text-sm text-slate-600">Your account exists, but it is not linked to an organization yet.</p>
      </div>

      <form action={action} className="space-y-4">
        <Field>
          <FieldLabel>Organization name</FieldLabel>
          <Input
            name="organizationName"
            placeholder="Northwind Hospital"
            defaultValue={state.values?.organizationName ?? ""}
            required
          />
        </Field>

        <FieldError>{state.error}</FieldError>
        <AuthSubmitButton idleLabel="Create organization" pendingLabel="Creating organization..." />
      </form>
    </Card>
  );
}
