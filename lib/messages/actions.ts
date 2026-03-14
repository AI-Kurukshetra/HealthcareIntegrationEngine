"use server";

import { redirect } from "next/navigation";

import type { FormState } from "@/lib/auth/form-state";
import { requireRoleAccess } from "@/lib/auth/guards";
import { adminRoles } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import type { MessageFormValues } from "@/lib/messages/types";
import { validateMessageForm } from "@/lib/messages/validation";

function getField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function asFormValues(values: MessageFormValues): Record<string, string> {
  return {
    organization_id: values.organization_id,
    channel_id: values.channel_id,
    message_type: values.message_type,
    payload: values.payload,
    status: values.status,
    direction: values.direction,
    received_at: values.received_at,
    processed_at: values.processed_at,
    error_message: values.error_message
  };
}

function parsePayload(payload: string) {
  try {
    return {
      payloadJson: JSON.parse(payload),
      rawPayload: payload
    };
  } catch {
    return {
      payloadJson: null,
      rawPayload: payload
    };
  }
}

export async function storeMessageAction(_: FormState, formData: FormData): Promise<FormState> {
  const context = await requireRoleAccess(adminRoles);
  const parsed = validateMessageForm({
    organization_id: getField(formData, "organization_id"),
    channel_id: getField(formData, "channel_id"),
    message_type: getField(formData, "message_type"),
    payload: String(formData.get("payload") ?? ""),
    status: getField(formData, "status"),
    direction: getField(formData, "direction"),
    received_at: getField(formData, "received_at"),
    processed_at: getField(formData, "processed_at"),
    error_message: String(formData.get("error_message") ?? "")
  });

  if (parsed.error) {
    return {
      error: parsed.error,
      values: asFormValues(parsed.values)
    };
  }

  if (parsed.values.organization_id !== context.organization.id) {
    return {
      error: "Organization mismatch.",
      values: asFormValues(parsed.values)
    };
  }

  const { payloadJson, rawPayload } = parsePayload(parsed.values.payload);
  const supabase = await createClient();

  const insertPayload = {
    organization_id: parsed.values.organization_id,
    channel_id: parsed.values.channel_id,
    direction: parsed.values.direction,
    message_type: parsed.values.message_type,
    content_type: payloadJson ? "application/json" : "text/plain",
    raw_payload: rawPayload,
    payload: payloadJson,
    status: parsed.values.status,
    received_at: parsed.values.received_at || new Date().toISOString(),
    processed_at: parsed.values.processed_at || null,
    error_message: parsed.values.error_message || null,
    failed_at: parsed.values.status === "failed" ? new Date().toISOString() : null,
    created_by: context.user.id,
    updated_by: context.user.id
  };

  const { data: created, error } = await supabase.from("messages").insert(insertPayload).select("*").single();

  if (error || !created) {
    return {
      error: error?.message ?? "Unable to store message.",
      values: asFormValues(parsed.values)
    };
  }

  redirect(`/dashboard/messages/${created.id}`);
}
