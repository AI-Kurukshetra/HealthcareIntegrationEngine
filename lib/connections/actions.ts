"use server";

import { redirect } from "next/navigation";

import type { FormState } from "@/lib/auth/form-state";
import { requireRoleAccess } from "@/lib/auth/guards";
import { adminRoles } from "@/lib/auth/rbac";
import type { ChannelType, ConnectionStatus, Json } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/server";
import { getConnectionErrorMessage, slugifyConnectionName, validateConnectionForm } from "@/lib/connections/validation";
import type { ConnectionFormValues } from "@/lib/connections/types";

function getField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function asFormValues(values: ConnectionFormValues): Record<string, string> {
  return {
    organization_id: values.organization_id,
    source_system_id: values.source_system_id,
    target_system_id: values.target_system_id,
    protocol_type: values.protocol_type,
    endpoint: values.endpoint,
    credentials_placeholder: values.credentials_placeholder,
    status: values.status,
    health_check_interval_minutes: values.health_check_interval_minutes
  };
}

function buildChannelName(protocolType: ChannelType, sourceName: string, targetName: string) {
  return `${protocolType.toUpperCase()} ${sourceName} -> ${targetName}`;
}

function asObject(value: Json): Record<string, Json | undefined> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, Json | undefined>;
}

export async function createConnectionAction(_: FormState, formData: FormData): Promise<FormState> {
  const context = await requireRoleAccess(adminRoles);
  const parsed = validateConnectionForm({
    organization_id: getField(formData, "organization_id"),
    source_system_id: getField(formData, "source_system_id"),
    target_system_id: getField(formData, "target_system_id"),
    protocol_type: getField(formData, "protocol_type"),
    endpoint: getField(formData, "endpoint"),
    credentials_placeholder: getField(formData, "credentials_placeholder"),
    status: getField(formData, "status"),
    health_check_interval_minutes: getField(formData, "health_check_interval_minutes")
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

  const supabase = await createClient();
  const { data: sourceSystem } = await supabase
    .from("systems")
    .select("*")
    .eq("id", parsed.values.source_system_id)
    .eq("organization_id", parsed.values.organization_id)
    .maybeSingle();
  const { data: targetSystem } = await supabase
    .from("systems")
    .select("*")
    .eq("id", parsed.values.target_system_id)
    .eq("organization_id", parsed.values.organization_id)
    .maybeSingle();

  if (!sourceSystem || !targetSystem) {
    return {
      error: "Selected systems were not found in this organization.",
      values: asFormValues(parsed.values)
    };
  }

  const channelSlug = `conn-${parsed.values.protocol_type}-${crypto.randomUUID().slice(0, 8)}`;
  const { data: channel, error: channelError } = await supabase
    .from("channels")
    .insert({
      organization_id: parsed.values.organization_id,
      name: buildChannelName(parsed.values.protocol_type, sourceSystem.name, targetSystem.name),
      slug: channelSlug,
      channel_type: parsed.values.protocol_type,
      direction: "bidirectional",
      endpoint_url: parsed.values.endpoint,
      status: "active",
      config: {
        endpoint: parsed.values.endpoint
      },
      created_by: context.user.id,
      updated_by: context.user.id
    })
    .select("*")
    .single();

  if (channelError || !channel) {
    return {
      error: getConnectionErrorMessage(channelError?.message),
      values: asFormValues(parsed.values)
    };
  }

  const connectionName = `${sourceSystem.name} -> ${targetSystem.name}`;
  const connectionSlug = slugifyConnectionName(`${connectionName}-${crypto.randomUUID().slice(0, 6)}`);
  const { data: connection, error: connectionError } = await supabase
    .from("connections")
    .insert({
      organization_id: parsed.values.organization_id,
      name: connectionName,
      slug: connectionSlug,
      source_system_id: parsed.values.source_system_id,
      target_system_id: parsed.values.target_system_id,
      channel_id: channel.id,
      status: parsed.values.status,
      retry_policy: {
        max_attempts: 3,
        backoff_seconds: 60
      },
      config: {
        protocol_type: parsed.values.protocol_type,
        endpoint: parsed.values.endpoint,
        credentials_placeholder: parsed.values.credentials_placeholder || null,
        health_check_interval_minutes: Number.parseInt(parsed.values.health_check_interval_minutes, 10)
      },
      created_by: context.user.id,
      updated_by: context.user.id
    })
    .select("*")
    .single();

  if (connectionError || !connection) {
    return {
      error: getConnectionErrorMessage(connectionError?.message),
      values: asFormValues(parsed.values)
    };
  }

  redirect(`/dashboard/connections/${connection.id}`);
}

export async function updateConnectionAction(
  connectionId: string,
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const context = await requireRoleAccess(adminRoles);
  const parsed = validateConnectionForm({
    organization_id: getField(formData, "organization_id"),
    source_system_id: getField(formData, "source_system_id"),
    target_system_id: getField(formData, "target_system_id"),
    protocol_type: getField(formData, "protocol_type"),
    endpoint: getField(formData, "endpoint"),
    credentials_placeholder: getField(formData, "credentials_placeholder"),
    status: getField(formData, "status"),
    health_check_interval_minutes: getField(formData, "health_check_interval_minutes")
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

  const supabase = await createClient();
  const { data: existingConnection } = await supabase
    .from("connections")
    .select("*")
    .eq("id", connectionId)
    .eq("organization_id", parsed.values.organization_id)
    .maybeSingle();

  if (!existingConnection) {
    return {
      error: "Connection not found.",
      values: asFormValues(parsed.values)
    };
  }

  const { data: sourceSystem } = await supabase
    .from("systems")
    .select("*")
    .eq("id", parsed.values.source_system_id)
    .eq("organization_id", parsed.values.organization_id)
    .maybeSingle();
  const { data: targetSystem } = await supabase
    .from("systems")
    .select("*")
    .eq("id", parsed.values.target_system_id)
    .eq("organization_id", parsed.values.organization_id)
    .maybeSingle();

  if (!sourceSystem || !targetSystem) {
    return {
      error: "Selected systems were not found in this organization.",
      values: asFormValues(parsed.values)
    };
  }

  const config = asObject(existingConnection.config);
  const mergedConfig = {
    ...config,
    protocol_type: parsed.values.protocol_type,
    endpoint: parsed.values.endpoint,
    credentials_placeholder: parsed.values.credentials_placeholder || null,
    health_check_interval_minutes: Number.parseInt(parsed.values.health_check_interval_minutes, 10)
  };

  const { error: channelUpdateError } = await supabase
    .from("channels")
    .update({
      channel_type: parsed.values.protocol_type,
      endpoint_url: parsed.values.endpoint,
      name: buildChannelName(parsed.values.protocol_type, sourceSystem.name, targetSystem.name),
      status: parsed.values.status === "archived" ? "inactive" : "active",
      config: {
        endpoint: parsed.values.endpoint
      },
      updated_by: context.user.id
    })
    .eq("id", existingConnection.channel_id)
    .eq("organization_id", parsed.values.organization_id);

  if (channelUpdateError) {
    return {
      error: getConnectionErrorMessage(channelUpdateError.message),
      values: asFormValues(parsed.values)
    };
  }

  const { error: connectionUpdateError } = await supabase
    .from("connections")
    .update({
      name: `${sourceSystem.name} -> ${targetSystem.name}`,
      source_system_id: parsed.values.source_system_id,
      target_system_id: parsed.values.target_system_id,
      status: parsed.values.status,
      config: mergedConfig,
      updated_by: context.user.id
    })
    .eq("id", connectionId)
    .eq("organization_id", parsed.values.organization_id);

  if (connectionUpdateError) {
    return {
      error: getConnectionErrorMessage(connectionUpdateError.message),
      values: asFormValues(parsed.values)
    };
  }

  redirect(`/dashboard/connections/${connectionId}`);
}

export async function setConnectionStatusAction(connectionId: string, nextStatus: ConnectionStatus) {
  const context = await requireRoleAccess(adminRoles);
  const supabase = await createClient();

  const { data: connection } = await supabase
    .from("connections")
    .select("*")
    .eq("id", connectionId)
    .eq("organization_id", context.organization.id)
    .maybeSingle();

  if (!connection) {
    redirect("/dashboard/connections");
  }

  const nowIso = new Date().toISOString();

  await supabase
    .from("connections")
    .update({
      status: nextStatus,
      last_heartbeat_at: nextStatus === "active" ? nowIso : connection.last_heartbeat_at,
      updated_by: context.user.id
    })
    .eq("id", connectionId)
    .eq("organization_id", context.organization.id);

  redirect(`/dashboard/connections/${connectionId}`);
}
