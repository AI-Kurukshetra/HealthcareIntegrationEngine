"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Card } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { initialFormState, type FormState } from "@/lib/auth/form-state";
import { MESSAGE_STATUS_OPTIONS } from "@/lib/messages/types";
import type { ChannelRow } from "@/lib/types/database";

interface MessageFormProps {
  action: (_: FormState, formData: FormData) => Promise<FormState>;
  organizationId: string;
  channels: ChannelRow[];
  cancelHref: string;
}

export function MessageForm({ action, organizationId, channels, cancelHref }: MessageFormProps) {
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <Card className="max-w-3xl space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Store message</h1>
        <p className="text-sm text-slate-600">Insert message payload for MVP processing and review workflows.</p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="organization_id" value={organizationId} />

        <Field>
          <FieldLabel>Channel</FieldLabel>
          <select
            name="channel_id"
            defaultValue={state.values?.channel_id ?? ""}
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
          <FieldLabel>Message type</FieldLabel>
          <Input name="message_type" defaultValue={state.values?.message_type ?? ""} placeholder="ADT_A01" required />
        </Field>

        <Field>
          <FieldLabel>Direction</FieldLabel>
          <select
            name="direction"
            defaultValue={state.values?.direction ?? "inbound"}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          >
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
            <option value="bidirectional">Bidirectional</option>
          </select>
        </Field>

        <Field>
          <FieldLabel>Status</FieldLabel>
          <select
            name="status"
            defaultValue={state.values?.status ?? "received"}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          >
            {MESSAGE_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>

        <Field>
          <FieldLabel>Received at</FieldLabel>
          <Input name="received_at" type="datetime-local" defaultValue={state.values?.received_at ?? ""} />
        </Field>

        <Field>
          <FieldLabel>Processed at</FieldLabel>
          <Input name="processed_at" type="datetime-local" defaultValue={state.values?.processed_at ?? ""} />
        </Field>

        <Field>
          <FieldLabel>Error message</FieldLabel>
          <Input name="error_message" defaultValue={state.values?.error_message ?? ""} />
        </Field>

        <Field>
          <FieldLabel>Payload</FieldLabel>
          <textarea
            name="payload"
            rows={8}
            defaultValue={state.values?.payload ?? ""}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            required
          />
        </Field>

        <FieldError>{state.error}</FieldError>

        <div className="flex flex-wrap gap-3">
          <AuthSubmitButton idleLabel="Store message" pendingLabel="Storing..." className="!w-auto !px-4 !text-white" />
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
