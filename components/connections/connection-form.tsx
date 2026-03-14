"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Card } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { initialFormState, type FormState } from "@/lib/auth/form-state";
import { CONNECTION_STATUS_OPTIONS, PROTOCOL_OPTIONS } from "@/lib/connections/types";
import type { SystemRow } from "@/lib/types/database";

interface ConnectionFormProps {
  title: string;
  description: string;
  action: (_: FormState, formData: FormData) => Promise<FormState>;
  organizationId: string;
  systems: SystemRow[];
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
  initialValues?: {
    source_system_id?: string;
    target_system_id?: string;
    protocol_type?: string;
    endpoint?: string;
    credentials_placeholder?: string;
    status?: string;
    health_check_interval_minutes?: string;
  };
}

export function ConnectionForm({
  title,
  description,
  action,
  organizationId,
  systems,
  submitLabel,
  pendingLabel,
  cancelHref,
  initialValues
}: ConnectionFormProps) {
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
          <FieldLabel>Source system</FieldLabel>
          <select
            name="source_system_id"
            defaultValue={state.values?.source_system_id ?? initialValues?.source_system_id ?? ""}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            required
          >
            <option value="" disabled>
              Select source system
            </option>
            {systems.map((system) => (
              <option key={system.id} value={system.id}>
                {system.name}
              </option>
            ))}
          </select>
        </Field>

        <Field>
          <FieldLabel>Target system</FieldLabel>
          <select
            name="target_system_id"
            defaultValue={state.values?.target_system_id ?? initialValues?.target_system_id ?? ""}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            required
          >
            <option value="" disabled>
              Select target system
            </option>
            {systems.map((system) => (
              <option key={system.id} value={system.id}>
                {system.name}
              </option>
            ))}
          </select>
        </Field>

        <Field>
          <FieldLabel>Protocol type</FieldLabel>
          <select
            name="protocol_type"
            defaultValue={state.values?.protocol_type ?? initialValues?.protocol_type ?? "api"}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          >
            {PROTOCOL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field>
          <FieldLabel>Endpoint</FieldLabel>
          <Input
            name="endpoint"
            placeholder="https://endpoint.vendor.com/integration"
            defaultValue={state.values?.endpoint ?? initialValues?.endpoint ?? ""}
            required
          />
        </Field>

        <Field>
          <FieldLabel>Credentials placeholder</FieldLabel>
          <Input
            name="credentials_placeholder"
            placeholder="vault://prod/conn/ehr-main"
            defaultValue={state.values?.credentials_placeholder ?? initialValues?.credentials_placeholder ?? ""}
          />
          <p className="text-xs text-slate-500">
            Do not enter real secrets here. Store only a reference key to secrets managed server-side.
          </p>
        </Field>

        <Field>
          <FieldLabel>Health check interval (minutes)</FieldLabel>
          <Input
            name="health_check_interval_minutes"
            type="number"
            min={1}
            max={1440}
            defaultValue={state.values?.health_check_interval_minutes ?? initialValues?.health_check_interval_minutes ?? "5"}
            required
          />
        </Field>

        <Field>
          <FieldLabel>Status</FieldLabel>
          <select
            name="status"
            defaultValue={state.values?.status ?? initialValues?.status ?? "draft"}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          >
            {CONNECTION_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
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
