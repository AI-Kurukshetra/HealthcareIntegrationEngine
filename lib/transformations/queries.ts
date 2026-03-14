import { createClient } from "@/lib/supabase/server";
import type { ChannelRow, Json, TransformationRow } from "@/lib/types/database";

import type { TransformationDetails, TransformationListItem } from "@/lib/transformations/types";

function prettyJson(value: Json) {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return "{}";
  }
}

export async function getTransformationsForOrganization(organizationId: string): Promise<TransformationListItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transformations")
    .select("*")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  const rows = (data ?? []) as TransformationRow[];
  const channelIds = Array.from(new Set(rows.map((row) => row.channel_id).filter(Boolean))) as string[];
  const { data: channels } = channelIds.length
    ? await supabase.from("channels").select("*").in("id", channelIds)
    : { data: [] as ChannelRow[] };
  const channelMap = new Map(((channels ?? []) as ChannelRow[]).map((channel) => [channel.id, channel]));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    channelName: row.channel_id ? channelMap.get(row.channel_id)?.name ?? null : null,
    inputFormat: row.source_format,
    outputFormat: row.target_format,
    isActive: row.status === "active",
    status: row.status,
    version: row.version,
    updatedAt: row.updated_at
  }));
}

export async function getTransformationDetails(transformationId: string, organizationId: string): Promise<TransformationDetails | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transformations")
    .select("*")
    .eq("id", transformationId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  const transformation = data as TransformationRow;
  const { data: channel } = transformation.channel_id
    ? await supabase.from("channels").select("*").eq("id", transformation.channel_id).maybeSingle()
    : { data: null };

  return {
    transformation,
    channelName: (channel as ChannelRow | null)?.name ?? null,
    mappingConfigPretty: prettyJson(transformation.rule_config),
    isActive: transformation.status === "active"
  };
}

export async function getTransformationChannelOptions(organizationId: string): Promise<ChannelRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("channels").select("*").eq("organization_id", organizationId).order("name", { ascending: true });
  return (data ?? []) as ChannelRow[];
}
