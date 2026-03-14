"use server";

import { redirect } from "next/navigation";

import type { FormState } from "@/lib/auth/form-state";
import { requireRoleAccess } from "@/lib/auth/guards";
import { adminRoles } from "@/lib/auth/rbac";
import type { Json } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/server";
import type { ChannelFormValues } from "@/lib/channels/types";
import { getChannelErrorMessage, slugifyChannelName, validateChannelForm } from "@/lib/channels/validation";

function getField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function asFormValues(values: ChannelFormValues): Record<string, string> {
  return {
    organization_id: values.organization_id,
    name: values.name,
    source_system_id: values.source_system_id,
    destination_system_id: values.destination_system_id,
    connection_id: values.connection_id,
    direction: values.direction,
    is_active: values.is_active,
    filtering_rules: values.filtering_rules
  };
}

function parseConfig(value: Json): Record<string, Json | undefined> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, Json | undefined>;
}

export async function createChannelAction(_: FormState, formData: FormData): Promise<FormState> {
  const context = await requireRoleAccess(adminRoles);
  const parsed = validateChannelForm({
    organization_id: getField(formData, "organization_id"),
    name: getField(formData, "name"),
    source_system_id: getField(formData, "source_system_id"),
    destination_system_id: getField(formData, "destination_system_id"),
    connection_id: getField(formData, "connection_id"),
    direction: getField(formData, "direction"),
    is_active: getField(formData, "is_active"),
    filtering_rules: getField(formData, "filtering_rules")
  });

  if (parsed.error) {
    return { error: parsed.error, values: asFormValues(parsed.values) };
  }

  if (parsed.values.organization_id !== context.organization.id) {
    return { error: "Organization mismatch.", values: asFormValues(parsed.values) };
  }

  const supabase = await createClient();
  const { data: created, error } = await supabase
    .from("channels")
    .insert({
      organization_id: parsed.values.organization_id,
      name: parsed.values.name,
      slug: slugifyChannelName(`${parsed.values.name}-${crypto.randomUUID().slice(0, 6)}`),
      channel_type: "api",
      direction: parsed.values.direction,
      endpoint_url: null,
      status: parsed.values.is_active === "true" ? "active" : "inactive",
      config: {
        source_system_id: parsed.values.source_system_id,
        destination_system_id: parsed.values.destination_system_id,
        connection_id: parsed.values.connection_id,
        filtering_rules: parsed.values.filtering_rules || ""
      },
      created_by: context.user.id,
      updated_by: context.user.id
    })
    .select("*")
    .single();

  if (error || !created) {
    return { error: getChannelErrorMessage(error?.message), values: asFormValues(parsed.values) };
  }

  redirect(`/dashboard/channels/${created.id}`);
}

export async function updateChannelAction(channelId: string, _: FormState, formData: FormData): Promise<FormState> {
  const context = await requireRoleAccess(adminRoles);
  const parsed = validateChannelForm({
    organization_id: getField(formData, "organization_id"),
    name: getField(formData, "name"),
    source_system_id: getField(formData, "source_system_id"),
    destination_system_id: getField(formData, "destination_system_id"),
    connection_id: getField(formData, "connection_id"),
    direction: getField(formData, "direction"),
    is_active: getField(formData, "is_active"),
    filtering_rules: getField(formData, "filtering_rules")
  });

  if (parsed.error) {
    return { error: parsed.error, values: asFormValues(parsed.values) };
  }

  if (parsed.values.organization_id !== context.organization.id) {
    return { error: "Organization mismatch.", values: asFormValues(parsed.values) };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("channels")
    .select("*")
    .eq("id", channelId)
    .eq("organization_id", parsed.values.organization_id)
    .maybeSingle();

  if (!existing) {
    return { error: "Channel not found.", values: asFormValues(parsed.values) };
  }

  const currentConfig = parseConfig(existing.config);
  const mergedConfig = {
    ...currentConfig,
    source_system_id: parsed.values.source_system_id,
    destination_system_id: parsed.values.destination_system_id,
    connection_id: parsed.values.connection_id,
    filtering_rules: parsed.values.filtering_rules || ""
  };

  const { error } = await supabase
    .from("channels")
    .update({
      name: parsed.values.name,
      direction: parsed.values.direction,
      status: parsed.values.is_active === "true" ? "active" : "inactive",
      config: mergedConfig,
      updated_by: context.user.id
    })
    .eq("id", channelId)
    .eq("organization_id", parsed.values.organization_id);

  if (error) {
    return { error: getChannelErrorMessage(error.message), values: asFormValues(parsed.values) };
  }

  redirect(`/dashboard/channels/${channelId}`);
}
