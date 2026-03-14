import type { Json } from "@/lib/types/database";

import type { TransformationFormValues } from "@/lib/transformations/types";

function normalize(value: string) {
  return value.trim();
}

function parseMappingConfig(value: string): Json | null {
  if (!value.trim()) {
    return {};
  }

  try {
    return JSON.parse(value) as Json;
  } catch {
    return null;
  }
}

export function validateTransformationForm(rawValues: {
  organization_id: string;
  name: string;
  channel_id: string;
  input_format: string;
  output_format: string;
  mapping_config: string;
  is_active: string;
}): { values: TransformationFormValues; error: string | null; parsedRuleConfig: Json | null } {
  const organizationId = normalize(rawValues.organization_id);
  const name = normalize(rawValues.name);
  const channelId = normalize(rawValues.channel_id);
  const inputFormat = normalize(rawValues.input_format);
  const outputFormat = normalize(rawValues.output_format);
  const mappingConfig = rawValues.mapping_config.trim();
  const isActive = rawValues.is_active === "true" ? "true" : "false";
  const parsedRuleConfig = parseMappingConfig(mappingConfig);

  const values: TransformationFormValues = {
    organization_id: organizationId,
    name,
    channel_id: channelId,
    input_format: inputFormat,
    output_format: outputFormat,
    mapping_config: mappingConfig,
    is_active: isActive
  };

  if (!organizationId) {
    return { values, error: "Organization id is required.", parsedRuleConfig: null };
  }

  if (!name) {
    return { values, error: "Transformation name is required.", parsedRuleConfig: null };
  }

  if (!channelId) {
    return { values, error: "Channel is required.", parsedRuleConfig: null };
  }

  if (!inputFormat || !outputFormat) {
    return { values, error: "Input and output formats are required.", parsedRuleConfig: null };
  }

  if (parsedRuleConfig === null) {
    return { values, error: "Mapping config must be valid JSON.", parsedRuleConfig: null };
  }

  return { values, error: null, parsedRuleConfig };
}

export function getTransformationErrorMessage(message?: string | null) {
  if (!message) {
    return "Something went wrong. Please try again.";
  }

  const normalized = message.toLowerCase();

  if (normalized.includes("transformations_name_not_blank")) {
    return "Transformation name is required.";
  }

  return message;
}
