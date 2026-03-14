import type { FlowDirection } from "@/lib/types/database";

import type { ChannelFormValues } from "@/lib/channels/types";

function normalize(value: string) {
  return value.trim();
}

function parseDirection(value: string): FlowDirection | null {
  const allowed: FlowDirection[] = ["inbound", "outbound", "bidirectional"];
  return allowed.includes(value as FlowDirection) ? (value as FlowDirection) : null;
}

export function slugifyChannelName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function validateChannelForm(rawValues: {
  organization_id: string;
  name: string;
  source_system_id: string;
  destination_system_id: string;
  connection_id: string;
  direction: string;
  is_active: string;
  filtering_rules: string;
}): { values: ChannelFormValues; error: string | null } {
  const organizationId = normalize(rawValues.organization_id);
  const name = normalize(rawValues.name);
  const sourceSystemId = normalize(rawValues.source_system_id);
  const destinationSystemId = normalize(rawValues.destination_system_id);
  const connectionId = normalize(rawValues.connection_id);
  const direction = parseDirection(rawValues.direction);
  const isActive = rawValues.is_active === "true" ? "true" : "false";
  const filteringRules = rawValues.filtering_rules.trim();

  const fallback: ChannelFormValues = {
    organization_id: organizationId,
    name,
    source_system_id: sourceSystemId,
    destination_system_id: destinationSystemId,
    connection_id: connectionId,
    direction: direction ?? "bidirectional",
    is_active: isActive,
    filtering_rules: filteringRules
  };

  if (!organizationId) {
    return { values: fallback, error: "Organization id is required." };
  }

  if (!name) {
    return { values: fallback, error: "Channel name is required." };
  }

  if (!sourceSystemId || !destinationSystemId) {
    return { values: fallback, error: "Source and destination systems are required." };
  }

  if (sourceSystemId === destinationSystemId) {
    return { values: fallback, error: "Source and destination systems must be different." };
  }

  if (!connectionId) {
    return { values: fallback, error: "Connection is required." };
  }

  if (!direction) {
    return { values: fallback, error: "Direction is invalid." };
  }

  return {
    values: {
      ...fallback,
      direction
    },
    error: null
  };
}

export function getChannelErrorMessage(message?: string | null) {
  if (!message) {
    return "Something went wrong. Please try again.";
  }

  const normalized = message.toLowerCase();

  if (normalized.includes("channels_org_slug_unique_idx") || normalized.includes("duplicate key")) {
    return "A similar channel already exists. Try a different channel name.";
  }

  return message;
}
