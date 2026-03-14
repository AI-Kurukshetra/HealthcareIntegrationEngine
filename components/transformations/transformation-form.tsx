"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Card } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { initialFormState, type FormState } from "@/lib/auth/form-state";
import type { ChannelRow } from "@/lib/types/database";

interface TransformationFormProps {
  title: string;
  description: string;
  action: (_: FormState, formData: FormData) => Promise<FormState>;
  organizationId: string;
  channels: ChannelRow[];
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
  initialValues?: {
    name?: string;
    channel_id?: string;
    input_format?: string;
    output_format?: string;
    mapping_config?: string;
    is_active?: string;
  };
}

export function TransformationForm({
  title,
  description,
  action,
  organizationId,
  channels,
  submitLabel,
  pendingLabel,
  cancelHref,
  initialValues
}: TransformationFormProps) {
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
          <FieldLabel>Name</FieldLabel>
          <Input name="name" defaultValue={state.values?.name ?? initialValues?.name ?? ""} placeholder="ADT to FHIR mapper" required />
        </Field>

        <Field>
          <FieldLabel>Channel</FieldLabel>
          <select
            name="channel_id"
            defaultValue={state.values?.channel_id ?? initialValues?.channel_id ?? ""}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            required
          >
            <option value="" disabled>
              Select channel
            </option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>
        </Field>

        <Field>
          <FieldLabel>Input format</FieldLabel>
          <Input name="input_format" defaultValue={state.values?.input_format ?? initialValues?.input_format ?? ""} placeholder="HL7v2" required />
        </Field>

        <Field>
          <FieldLabel>Output format</FieldLabel>
          <Input name="output_format" defaultValue={state.values?.output_format ?? initialValues?.output_format ?? ""} placeholder="FHIR R4" required />
        </Field>

        <Field>
          <FieldLabel>Mapping config (JSON)</FieldLabel>
          <textarea
            name="mapping_config"
            rows={10}
            defaultValue={state.values?.mapping_config ?? initialValues?.mapping_config ?? "{}"}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            required
          />
        </Field>

        <Field>
          <FieldLabel>Active</FieldLabel>
          <select
            name="is_active"
            defaultValue={state.values?.is_active ?? initialValues?.is_active ?? "true"}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
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
