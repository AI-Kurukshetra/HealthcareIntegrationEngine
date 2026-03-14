import { createClient } from "@/lib/supabase/server";
import type { ChannelRow, ConnectionRow, Json, SystemRow } from "@/lib/types/database";

import type { ConnectionDetails, ConnectionListItem } from "@/lib/connections/types";

function asObject(value: Json): Record<string, Json | undefined> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, Json | undefined>;
}

function asString(value: Json | undefined): string | null {
  return typeof value === "string" ? value : null;
}

function asNumber(value: Json | undefined): number | null {
  return typeof value === "number" ? value : null;
}

export async function getConnectionListForOrganization(organizationId: string): Promise<ConnectionListItem[]> {
  const supabase = await createClient();

  const { data: connections } = await supabase
    .from("connections")
    .select("*")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  const rows = (connections ?? []) as ConnectionRow[];
  const sourceIds = rows.map((row) => row.source_system_id);
  const targetIds = rows.map((row) => row.target_system_id);
  const systemIds = Array.from(new Set([...sourceIds, ...targetIds]));
  const channelIds = Array.from(new Set(rows.map((row) => row.channel_id)));

  const { data: systems } = systemIds.length
    ? await supabase.from("systems").select("*").in("id", systemIds)
    : { data: [] as SystemRow[] };

  const { data: channels } = channelIds.length
    ? await supabase.from("channels").select("*").in("id", channelIds)
    : { data: [] as ChannelRow[] };

  const systemMap = new Map(((systems ?? []) as SystemRow[]).map((system) => [system.id, system]));
  const channelMap = new Map(((channels ?? []) as ChannelRow[]).map((channel) => [channel.id, channel]));

  return rows.map((row) => {
    const source = systemMap.get(row.source_system_id);
    const target = systemMap.get(row.target_system_id);
    const channel = channelMap.get(row.channel_id);
    const config = asObject(row.config);

    return {
      id: row.id,
      name: row.name,
      status: row.status,
      sourceSystemName: source?.name ?? "Unknown source",
      targetSystemName: target?.name ?? "Unknown target",
      protocolType: channel?.channel_type ?? "api",
      endpoint: asString(config.endpoint) ?? channel?.endpoint_url ?? null,
      healthCheckIntervalMinutes: asNumber(config.health_check_interval_minutes),
      lastHeartbeatAt: row.last_heartbeat_at,
      lastErrorAt: row.last_error_at
    };
  });
}

export async function getConnectionDetails(connectionId: string, organizationId: string): Promise<ConnectionDetails | null> {
  const supabase = await createClient();

  const { data: connectionData } = await supabase
    .from("connections")
    .select("*")
    .eq("id", connectionId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!connectionData) {
    return null;
  }

  const connection = connectionData as ConnectionRow;
  const { data: sourceSystem } = await supabase
    .from("systems")
    .select("*")
    .eq("id", connection.source_system_id)
    .maybeSingle();
  const { data: targetSystem } = await supabase
    .from("systems")
    .select("*")
    .eq("id", connection.target_system_id)
    .maybeSingle();
  const { data: channel } = await supabase.from("channels").select("*").eq("id", connection.channel_id).maybeSingle();

  const config = asObject(connection.config);

  return {
    connection,
    sourceSystem: (sourceSystem as SystemRow | null) ?? null,
    targetSystem: (targetSystem as SystemRow | null) ?? null,
    protocolType: ((channel as ChannelRow | null)?.channel_type ?? "api"),
    endpoint: asString(config.endpoint) ?? ((channel as ChannelRow | null)?.endpoint_url ?? null),
    credentialsPlaceholder: asString(config.credentials_placeholder),
    healthCheckIntervalMinutes: asNumber(config.health_check_interval_minutes)
  };
}

export async function getSystemOptions(organizationId: string): Promise<SystemRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("systems").select("*").eq("organization_id", organizationId).order("name", { ascending: true });
  return (data ?? []) as SystemRow[];
}
