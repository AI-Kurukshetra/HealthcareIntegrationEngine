import type { MessageRow, MessageStatus } from "@/lib/types/database";

export interface MessageFilters {
  status?: MessageStatus;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export interface MessageListItem {
  id: string;
  channelName: string | null;
  messageType: string;
  status: MessageStatus;
  receivedAt: string;
  processedAt: string | null;
  errorMessage: string | null;
  payloadPreview: string;
}

export interface MessageDetails {
  message: MessageRow;
  channelName: string | null;
  payloadPretty: string;
}

export interface MessageFormValues {
  organization_id: string;
  channel_id: string;
  message_type: string;
  payload: string;
  status: MessageStatus;
  direction: "inbound" | "outbound" | "bidirectional";
  received_at: string;
  processed_at: string;
  error_message: string;
}

export const MESSAGE_STATUS_OPTIONS: MessageStatus[] = [
  "received",
  "queued",
  "processing",
  "transformed",
  "delivered",
  "failed",
  "acknowledged"
];
