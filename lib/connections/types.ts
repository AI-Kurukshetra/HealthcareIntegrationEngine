import type { ChannelType, ConnectionRow, ConnectionStatus, SystemRow } from "@/lib/types/database";

export interface ConnectionFormValues {
  organization_id: string;
  source_system_id: string;
  target_system_id: string;
  protocol_type: ChannelType;
  endpoint: string;
  credentials_placeholder: string;
  status: ConnectionStatus;
  health_check_interval_minutes: string;
}

export interface ConnectionListItem {
  id: string;
  name: string;
  status: ConnectionStatus;
  sourceSystemName: string;
  targetSystemName: string;
  protocolType: ChannelType;
  endpoint: string | null;
  healthCheckIntervalMinutes: number | null;
  lastHeartbeatAt: string | null;
  lastErrorAt: string | null;
}

export interface ConnectionDetails {
  connection: ConnectionRow;
  sourceSystem: SystemRow | null;
  targetSystem: SystemRow | null;
  protocolType: ChannelType;
  endpoint: string | null;
  credentialsPlaceholder: string | null;
  healthCheckIntervalMinutes: number | null;
}

export const PROTOCOL_OPTIONS: Array<{ value: ChannelType; label: string }> = [
  { value: "hl7", label: "HL7" },
  { value: "fhir", label: "FHIR" },
  { value: "api", label: "API" },
  { value: "sftp", label: "SFTP" },
  { value: "webhook", label: "Webhook" },
  { value: "manual", label: "Manual" }
];

export const CONNECTION_STATUS_OPTIONS: Array<{ value: ConnectionStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "error", label: "Error" },
  { value: "archived", label: "Archived" }
];
