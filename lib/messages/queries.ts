import { createClient } from "@/lib/supabase/server";
import type { ChannelRow, Json, MessageRow } from "@/lib/types/database";

import type { MessageDetails, MessageFilters, MessageListItem } from "@/lib/messages/types";

function makePayloadPreview(message: MessageRow) {
  if (message.payload) {
    return JSON.stringify(message.payload).slice(0, 120);
  }

  if (message.raw_payload) {
    return message.raw_payload.slice(0, 120);
  }

  return "No payload";
}

function prettyPayload(payload: Json | null, rawPayload: string | null) {
  if (payload) {
    return JSON.stringify(payload, null, 2);
  }

  return rawPayload ?? "";
}

export async function getMessagesForOrganization(
  organizationId: string,
  filters: MessageFilters = {}
): Promise<MessageListItem[]> {
  const supabase = await createClient();
  const limit = Math.min(Math.max(filters.limit ?? 50, 1), 200);
  let query = supabase
    .from("messages")
    .select("*")
    .eq("organization_id", organizationId)
    .order("received_at", { ascending: false })
    .limit(limit);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.dateFrom) {
    query = query.gte("received_at", `${filters.dateFrom}T00:00:00.000Z`);
  }

  if (filters.dateTo) {
    query = query.lte("received_at", `${filters.dateTo}T23:59:59.999Z`);
  }

  const { data } = await query;
  const messages = (data ?? []) as MessageRow[];
  const channelIds = Array.from(new Set(messages.map((message) => message.channel_id).filter(Boolean))) as string[];
  const { data: channels } = channelIds.length
    ? await supabase.from("channels").select("*").in("id", channelIds)
    : { data: [] as ChannelRow[] };
  const channelMap = new Map(((channels ?? []) as ChannelRow[]).map((channel) => [channel.id, channel]));

  return messages.map((message) => ({
    id: message.id,
    channelName: message.channel_id ? channelMap.get(message.channel_id)?.name ?? null : null,
    messageType: message.message_type,
    status: message.status,
    receivedAt: message.received_at,
    processedAt: message.processed_at,
    errorMessage: message.error_message,
    payloadPreview: makePayloadPreview(message)
  }));
}

export async function getMessageDetails(messageId: string, organizationId: string): Promise<MessageDetails | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("id", messageId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  const message = data as MessageRow;
  const { data: channel } = message.channel_id
    ? await supabase.from("channels").select("*").eq("id", message.channel_id).maybeSingle()
    : { data: null };

  return {
    message,
    channelName: (channel as ChannelRow | null)?.name ?? null,
    payloadPretty: prettyPayload(message.payload, message.raw_payload)
  };
}

export async function getMessageChannelOptions(organizationId: string): Promise<ChannelRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("channels").select("*").eq("organization_id", organizationId).order("name", { ascending: true });
  return (data ?? []) as ChannelRow[];
}
