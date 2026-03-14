"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Card } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { initialFormState, type FormState } from "@/lib/auth/form-state";
import { SYSTEM_TYPE_OPTIONS } from "@/lib/systems/types";

interface SystemFormProps {
  title: string;
  description: string;
  action: (_: FormState, formData: FormData) => Promise<FormState>;
  organizationId: string;
  initialValues?: {
    name?: string;
    type?: string;
    vendor?: string;
    base_url?: string;
    notes?: string;
    status?: "active" | "inactive" | "draft";
  };
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
}

export function SystemForm({
  title,
  description,
  action,
  organizationId,
  initialValues,
  submitLabel,
  pendingLabel,
  cancelHref
}: SystemFormProps) {
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <Card className="max-w-3xl space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-600">{description}</p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="organization_id" value={organizationId} />

        <Field>
          <FieldLabel>Organization id</FieldLabel>
          <Input value={organizationId} readOnly disabled />
        </Field>

        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input name="name" placeholder="Epic Core EHR" defaultValue={state.values?.name ?? initialValues?.name ?? ""} required />
        </Field>

        <Field>
          <FieldLabel>Type</FieldLabel>
          <select
            name="type"
            defaultValue={state.values?.type ?? initialValues?.type ?? "ehr"}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          >
            {SYSTEM_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field>
          <FieldLabel>Vendor</FieldLabel>
          <Input name="vendor" placeholder="Epic Systems" defaultValue={state.values?.vendor ?? initialValues?.vendor ?? ""} />
        </Field>

        <Field>
          <FieldLabel>Base URL</FieldLabel>
          <Input
            name="base_url"
            placeholder="https://api.vendor.com"
            defaultValue={state.values?.base_url ?? initialValues?.base_url ?? ""}
          />
        </Field>

        <Field>
          <FieldLabel>Notes</FieldLabel>
          <textarea
            name="notes"
            defaultValue={state.values?.notes ?? initialValues?.notes ?? ""}
            rows={4}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
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
            <option value="draft">Draft</option>
          </select>
        </Field>

        <FieldError>{state.error}</FieldError>

        <div className="flex flex-wrap gap-3">
          <AuthSubmitButton idleLabel={submitLabel} pendingLabel={pendingLabel} className="!w-auto !px-4 !text-white" />
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
