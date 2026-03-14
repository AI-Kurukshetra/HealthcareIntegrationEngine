import { createClient } from "@/lib/supabase/server";
import type { ChannelRow, ConnectionRow, Json, SystemRow } from "@/lib/types/database";

import type { ChannelDetails, ChannelListItem } from "@/lib/channels/types";

function asObject(value: Json): Record<string, Json | undefined> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, Json | undefined>;
}

function asString(value: Json | undefined): string | null {
  return typeof value === "string" ? value : null;
}

function readConfigIds(config: Json) {
  const object = asObject(config);
  return {
    sourceSystemId: asString(object.source_system_id),
    destinationSystemId: asString(object.destination_system_id),
    connectionId: asString(object.connection_id),
    filteringRules: asString(object.filtering_rules) ?? ""
  };
}

export async function getChannelsForOrganization(organizationId: string): Promise<ChannelListItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("channels")
    .select("*")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  const channels = (data ?? []) as ChannelRow[];
  const configRefs = channels.map((channel) => readConfigIds(channel.config));
  const systemIds = Array.from(
    new Set(configRefs.flatMap((item) => [item.sourceSystemId, item.destinationSystemId]).filter(Boolean))
  ) as string[];
  const connectionIds = Array.from(new Set(configRefs.map((item) => item.connectionId).filter(Boolean))) as string[];

  const { data: systems } = systemIds.length
    ? await supabase.from("systems").select("*").in("id", systemIds)
    : { data: [] as SystemRow[] };
  const { data: connections } = connectionIds.length
    ? await supabase.from("connections").select("*").in("id", connectionIds)
    : { data: [] as ConnectionRow[] };

  const systemMap = new Map(((systems ?? []) as SystemRow[]).map((item) => [item.id, item]));
  const connectionMap = new Map(((connections ?? []) as ConnectionRow[]).map((item) => [item.id, item]));

  return channels.map((channel) => {
    const refs = readConfigIds(channel.config);
    const source = refs.sourceSystemId ? systemMap.get(refs.sourceSystemId) : null;
    const destination = refs.destinationSystemId ? systemMap.get(refs.destinationSystemId) : null;
    const connection = refs.connectionId ? connectionMap.get(refs.connectionId) : null;

    return {
      id: channel.id,
      name: channel.name,
      sourceSystemName: source?.name ?? null,
      destinationSystemName: destination?.name ?? null,
      connectionName: connection?.name ?? null,
      direction: channel.direction,
      isActive: channel.status === "active",
      status: channel.status,
      updatedAt: channel.updated_at
    };
  });
}

export async function getChannelDetails(channelId: string, organizationId: string): Promise<ChannelDetails | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("channels")
    .select("*")
    .eq("id", channelId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  const channel = data as ChannelRow;
  const refs = readConfigIds(channel.config);

  const { data: source } = refs.sourceSystemId
    ? await supabase.from("systems").select("*").eq("id", refs.sourceSystemId).maybeSingle()
    : { data: null };
  const { data: destination } = refs.destinationSystemId
    ? await supabase.from("systems").select("*").eq("id", refs.destinationSystemId).maybeSingle()
    : { data: null };
  const { data: connection } = refs.connectionId
    ? await supabase.from("connections").select("*").eq("id", refs.connectionId).maybeSingle()
    : { data: null };

  return {
    channel,
    sourceSystemId: refs.sourceSystemId,
    destinationSystemId: refs.destinationSystemId,
    connectionId: refs.connectionId,
    sourceSystemName: (source as SystemRow | null)?.name ?? null,
    destinationSystemName: (destination as SystemRow | null)?.name ?? null,
    connectionName: (connection as ConnectionRow | null)?.name ?? null,
    isActive: channel.status === "active",
    filteringRules: refs.filteringRules
  };
}

export async function getChannelFormOptions(organizationId: string) {
  const supabase = await createClient();
  const [{ data: systems }, { data: connections }] = await Promise.all([
    supabase.from("systems").select("*").eq("organization_id", organizationId).order("name", { ascending: true }),
    supabase.from("connections").select("*").eq("organization_id", organizationId).order("name", { ascending: true })
  ]);

  return {
    systems: (systems ?? []) as SystemRow[],
    connections: (connections ?? []) as ConnectionRow[]
  };
}
