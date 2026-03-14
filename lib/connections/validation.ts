import type { ChannelType, ConnectionStatus } from "@/lib/types/database";

import type { ConnectionFormValues } from "@/lib/connections/types";

function normalize(value: string) {
  return value.trim();
}

function parseProtocol(value: string): ChannelType | null {
  const allowed: ChannelType[] = ["hl7", "fhir", "api", "sftp", "webhook", "manual"];
  return allowed.includes(value as ChannelType) ? (value as ChannelType) : null;
}

function parseStatus(value: string): ConnectionStatus | null {
  const allowed: ConnectionStatus[] = ["draft", "active", "paused", "error", "archived"];
  return allowed.includes(value as ConnectionStatus) ? (value as ConnectionStatus) : null;
}

export function slugifyConnectionName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function validateConnectionForm(rawValues: {
  organization_id: string;
  source_system_id: string;
  target_system_id: string;
  protocol_type: string;
  endpoint: string;
  credentials_placeholder: string;
  status: string;
  health_check_interval_minutes: string;
}): { values: ConnectionFormValues; error: string | null } {
  const organizationId = normalize(rawValues.organization_id);
  const sourceSystemId = normalize(rawValues.source_system_id);
  const targetSystemId = normalize(rawValues.target_system_id);
  const protocolType = parseProtocol(rawValues.protocol_type);
  const endpoint = normalize(rawValues.endpoint);
  const credentialsPlaceholder = normalize(rawValues.credentials_placeholder);
  const status = parseStatus(rawValues.status);
  const healthCheckIntervalRaw = normalize(rawValues.health_check_interval_minutes);

  const fallback: ConnectionFormValues = {
    organization_id: organizationId,
    source_system_id: sourceSystemId,
    target_system_id: targetSystemId,
    protocol_type: protocolType ?? "api",
    endpoint,
    credentials_placeholder: credentialsPlaceholder,
    status: status ?? "draft",
    health_check_interval_minutes: healthCheckIntervalRaw
  };

  if (!organizationId) {
    return { values: fallback, error: "Organization id is required." };
  }

  if (!sourceSystemId || !targetSystemId) {
    return { values: fallback, error: "Source and target systems are required." };
  }

  if (sourceSystemId === targetSystemId) {
    return { values: fallback, error: "Source and target systems must be different." };
  }

  if (!protocolType) {
    return { values: fallback, error: "Protocol type is invalid." };
  }

  if (!endpoint) {
    return { values: fallback, error: "Endpoint is required." };
  }

  if (!status) {
    return { values: fallback, error: "Connection status is invalid." };
  }

  const interval = Number.parseInt(healthCheckIntervalRaw, 10);

  if (!Number.isFinite(interval) || interval < 1 || interval > 1440) {
    return { values: fallback, error: "Health check interval must be between 1 and 1440 minutes." };
  }

  return {
    values: {
      ...fallback,
      protocol_type: protocolType,
      status,
      health_check_interval_minutes: String(interval)
    },
    error: null
  };
}

export function getConnectionErrorMessage(message?: string | null) {
  if (!message) {
    return "Something went wrong. Please try again.";
  }

  const normalized = message.toLowerCase();

  if (normalized.includes("connections_org_slug_unique_idx") || normalized.includes("duplicate key")) {
    return "A similar connection already exists. Try a different source/target combination.";
  }

  return message;
}
