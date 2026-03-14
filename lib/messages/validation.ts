import { MESSAGE_STATUS_OPTIONS, type MessageFormValues } from "@/lib/messages/types";
import type { MessageStatus } from "@/lib/types/database";

function normalize(value: string) {
  return value.trim();
}

function parseStatus(value: string): MessageStatus | null {
  return MESSAGE_STATUS_OPTIONS.includes(value as MessageStatus) ? (value as MessageStatus) : null;
}

function parseDirection(value: string): MessageFormValues["direction"] | null {
  return value === "inbound" || value === "outbound" || value === "bidirectional"
    ? (value as MessageFormValues["direction"])
    : null;
}

export function validateMessageForm(rawValues: {
  organization_id: string;
  channel_id: string;
  message_type: string;
  payload: string;
  status: string;
  direction: string;
  received_at: string;
  processed_at: string;
  error_message: string;
}): { values: MessageFormValues; error: string | null } {
  const organizationId = normalize(rawValues.organization_id);
  const channelId = normalize(rawValues.channel_id);
  const messageType = normalize(rawValues.message_type);
  const payload = rawValues.payload.trim();
  const status = parseStatus(rawValues.status);
  const direction = parseDirection(rawValues.direction);
  const receivedAt = normalize(rawValues.received_at);
  const processedAt = normalize(rawValues.processed_at);
  const errorMessage = rawValues.error_message.trim();

  const fallback: MessageFormValues = {
    organization_id: organizationId,
    channel_id: channelId,
    message_type: messageType,
    payload,
    status: status ?? "received",
    direction: direction ?? "inbound",
    received_at: receivedAt,
    processed_at: processedAt,
    error_message: errorMessage
  };

  if (!organizationId) {
    return { values: fallback, error: "Organization id is required." };
  }

  if (!channelId) {
    return { values: fallback, error: "Channel is required." };
  }

  if (!messageType) {
    return { values: fallback, error: "Message type is required." };
  }

  if (!payload) {
    return { values: fallback, error: "Payload is required." };
  }

  if (!status || !direction) {
    return { values: fallback, error: "Message status or direction is invalid." };
  }

  return {
    values: {
      ...fallback,
      status,
      direction
    },
    error: null
  };
}
