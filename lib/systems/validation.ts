import type { ResourceStatus, SystemType } from "@/lib/types/database";

import type { SystemFormValues } from "@/lib/systems/types";

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function parseSystemType(value: string): SystemType | null {
  const allowed: SystemType[] = [
    "ehr",
    "emr",
    "lis",
    "ris",
    "pacs",
    "billing",
    "fhir_server",
    "hl7_broker",
    "api",
    "internal",
    "other"
  ];

  return allowed.includes(value as SystemType) ? (value as SystemType) : null;
}

function parseResourceStatus(value: string): ResourceStatus | null {
  const allowed: ResourceStatus[] = ["active", "inactive", "draft"];
  return allowed.includes(value as ResourceStatus) ? (value as ResourceStatus) : null;
}

export function slugifySystemName(name: string) {
  return normalizeWhitespace(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function validateSystemForm(rawValues: {
  name: string;
  type: string;
  vendor: string;
  base_url: string;
  notes: string;
  organization_id: string;
  status: string;
}): { values: SystemFormValues; error: string | null } {
  const name = normalizeWhitespace(rawValues.name);
  const type = parseSystemType(rawValues.type);
  const vendor = normalizeWhitespace(rawValues.vendor);
  const baseUrl = normalizeWhitespace(rawValues.base_url);
  const notes = rawValues.notes.trim();
  const organizationId = normalizeWhitespace(rawValues.organization_id);
  const status = parseResourceStatus(rawValues.status);

  if (!name) {
    return {
      values: {
        name,
        type: "other",
        vendor,
        base_url: baseUrl,
        notes,
        organization_id: organizationId,
        status: "active"
      },
      error: "System name is required."
    };
  }

  if (name.length < 2) {
    return {
      values: {
        name,
        type: type ?? "other",
        vendor,
        base_url: baseUrl,
        notes,
        organization_id: organizationId,
        status: status ?? "active"
      },
      error: "System name must be at least 2 characters."
    };
  }

  if (!organizationId) {
    return {
      values: {
        name,
        type: type ?? "other",
        vendor,
        base_url: baseUrl,
        notes,
        organization_id: organizationId,
        status: status ?? "active"
      },
      error: "Organization id is required."
    };
  }

  if (!type) {
    return {
      values: {
        name,
        type: "other",
        vendor,
        base_url: baseUrl,
        notes,
        organization_id: organizationId,
        status: status ?? "active"
      },
      error: "System type is invalid."
    };
  }

  if (!status) {
    return {
      values: {
        name,
        type,
        vendor,
        base_url: baseUrl,
        notes,
        organization_id: organizationId,
        status: "active"
      },
      error: "System status is invalid."
    };
  }

  if (baseUrl && !/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(baseUrl)) {
    return {
      values: {
        name,
        type,
        vendor,
        base_url: baseUrl,
        notes,
        organization_id: organizationId,
        status
      },
      error: "Base URL must be a valid http/https URL."
    };
  }

  return {
    values: {
      name,
      type,
      vendor,
      base_url: baseUrl,
      notes,
      organization_id: organizationId,
      status
    },
    error: null
  };
}

export function getSystemErrorMessage(message?: string | null) {
  if (!message) {
    return "Something went wrong. Please try again.";
  }

  const normalized = message.toLowerCase();

  if (normalized.includes("systems_org_slug_unique_idx") || normalized.includes("duplicate key")) {
    return "A system with a similar slug already exists. Try a different name.";
  }

  return message;
}
