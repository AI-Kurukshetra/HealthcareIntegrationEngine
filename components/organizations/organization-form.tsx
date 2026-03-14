"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Card } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { initialFormState, type FormState } from "@/lib/auth/form-state";

interface OrganizationFormProps {
  title: string;
  description: string;
  action: (_: FormState, formData: FormData) => Promise<FormState>;
  initialValues?: {
    name?: string;
    status?: "active" | "inactive";
  };
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
}

export function OrganizationForm({
  title,
  description,
  action,
  initialValues,
  submitLabel,
  pendingLabel,
  cancelHref
}: OrganizationFormProps) {
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <Card className="max-w-2xl space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-600">{description}</p>
      </div>

      <form action={formAction} className="space-y-4">
        <Field>
          <FieldLabel>Organization name</FieldLabel>
          <Input
            name="name"
            placeholder="Northwind Hospital"
            defaultValue={state.values?.name ?? initialValues?.name ?? ""}
            required
          />
        </Field>

        <Field>
          <FieldLabel>Status</FieldLabel>
          <select
            name="status"
            defaultValue={state.values?.status ?? initialValues?.status ?? "active"}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </Field>

        <FieldError>{state.error}</FieldError>

        <div className="flex flex-wrap gap-3">
          <AuthSubmitButton
            idleLabel={submitLabel}
            pendingLabel={pendingLabel}
            className="!w-auto !px-4 !text-white"
          />
          <Link
            href={cancelHref}
            className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
}
