"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Card } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { initialFormState, type FormState } from "@/lib/auth/form-state";
import type { ConnectionRow, SystemRow } from "@/lib/types/database";

interface ChannelFormProps {
  title: string;
  description: string;
  action: (_: FormState, formData: FormData) => Promise<FormState>;
  organizationId: string;
  systems: SystemRow[];
  connections: ConnectionRow[];
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
  initialValues?: {
    name?: string;
    source_system_id?: string;
    destination_system_id?: string;
    connection_id?: string;
    direction?: string;
    is_active?: string;
    filtering_rules?: string;
  };
}

export function ChannelForm({
  title,
  description,
  action,
  organizationId,
  systems,
  connections,
  submitLabel,
  pendingLabel,
  cancelHref,
  initialValues
}: ChannelFormProps) {
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
          <Input name="name" placeholder="ADT Intake Channel" defaultValue={state.values?.name ?? initialValues?.name ?? ""} required />
        </Field>

        <Field>
          <FieldLabel>Source system</FieldLabel>
          <select
            name="source_system_id"
            defaultValue={state.values?.source_system_id ?? initialValues?.source_system_id ?? ""}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            required
          >
            <option value="" disabled>
              Select source
            </option>
            {systems.map((system) => (
              <option key={system.id} value={system.id}>
                {system.name}
              </option>
            ))}
          </select>
        </Field>

        <Field>
          <FieldLabel>Destination system</FieldLabel>
          <select
            name="destination_system_id"
            defaultValue={state.values?.destination_system_id ?? initialValues?.destination_system_id ?? ""}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            required
          >
            <option value="" disabled>
              Select destination
            </option>
            {systems.map((system) => (
              <option key={system.id} value={system.id}>
                {system.name}
              </option>
            ))}
          </select>
        </Field>

        <Field>
          <FieldLabel>Connection</FieldLabel>
          <select
            name="connection_id"
            defaultValue={state.values?.connection_id ?? initialValues?.connection_id ?? ""}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            required
          >
            <option value="" disabled>
              Select connection
            </option>
            {connections.map((connection) => (
              <option key={connection.id} value={connection.id}>
                {connection.name}
              </option>
            ))}
          </select>
        </Field>

        <Field>
          <FieldLabel>Direction</FieldLabel>
          <select
            name="direction"
            defaultValue={state.values?.direction ?? initialValues?.direction ?? "bidirectional"}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          >
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
            <option value="bidirectional">Bidirectional</option>
          </select>
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

        <Field>
          <FieldLabel>Filtering rules</FieldLabel>
          <textarea
            name="filtering_rules"
            rows={5}
            defaultValue={state.values?.filtering_rules ?? initialValues?.filtering_rules ?? ""}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            placeholder='{"event_types":["ADT_A01","ADT_A04"],"include_test_patients":false}'
          />
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
