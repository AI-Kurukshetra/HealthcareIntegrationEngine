"use server";

import { redirect } from "next/navigation";

import type { FormState } from "@/lib/auth/form-state";
import { requireRoleAccess } from "@/lib/auth/guards";
import { adminRoles } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import type { TransformationFormValues } from "@/lib/transformations/types";
import { getTransformationErrorMessage, validateTransformationForm } from "@/lib/transformations/validation";

function getField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function asFormValues(values: TransformationFormValues): Record<string, string> {
  return {
    organization_id: values.organization_id,
    name: values.name,
    channel_id: values.channel_id,
    input_format: values.input_format,
    output_format: values.output_format,
    mapping_config: values.mapping_config,
    is_active: values.is_active
  };
}

export async function createTransformationAction(_: FormState, formData: FormData): Promise<FormState> {
  const context = await requireRoleAccess(adminRoles);
  const parsed = validateTransformationForm({
    organization_id: getField(formData, "organization_id"),
    name: getField(formData, "name"),
    channel_id: getField(formData, "channel_id"),
    input_format: getField(formData, "input_format"),
    output_format: getField(formData, "output_format"),
    mapping_config: String(formData.get("mapping_config") ?? ""),
    is_active: getField(formData, "is_active")
  });

  if (parsed.error || !parsed.parsedRuleConfig) {
    return {
      error: parsed.error ?? "Invalid mapping config.",
      values: asFormValues(parsed.values)
    };
  }

  if (parsed.values.organization_id !== context.organization.id) {
    return {
      error: "Organization mismatch.",
      values: asFormValues(parsed.values)
    };
  }

  const supabase = await createClient();
  const { data: created, error } = await supabase
    .from("transformations")
    .insert({
      organization_id: parsed.values.organization_id,
      channel_id: parsed.values.channel_id,
      connection_id: null,
      name: parsed.values.name,
      source_format: parsed.values.input_format,
      target_format: parsed.values.output_format,
      rule_config: parsed.parsedRuleConfig,
      status: parsed.values.is_active === "true" ? "active" : "inactive",
      version: 1,
      created_by: context.user.id,
      updated_by: context.user.id
    })
    .select("*")
    .single();

  if (error || !created) {
    return {
      error: getTransformationErrorMessage(error?.message),
      values: asFormValues(parsed.values)
    };
  }

  redirect(`/dashboard/transformations/${created.id}`);
}

export async function updateTransformationAction(
  transformationId: string,
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const context = await requireRoleAccess(adminRoles);
  const parsed = validateTransformationForm({
    organization_id: getField(formData, "organization_id"),
    name: getField(formData, "name"),
    channel_id: getField(formData, "channel_id"),
    input_format: getField(formData, "input_format"),
    output_format: getField(formData, "output_format"),
    mapping_config: String(formData.get("mapping_config") ?? ""),
    is_active: getField(formData, "is_active")
  });

  if (parsed.error || !parsed.parsedRuleConfig) {
    return {
      error: parsed.error ?? "Invalid mapping config.",
      values: asFormValues(parsed.values)
    };
  }

  if (parsed.values.organization_id !== context.organization.id) {
    return {
      error: "Organization mismatch.",
      values: asFormValues(parsed.values)
    };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("transformations")
    .select("*")
    .eq("id", transformationId)
    .eq("organization_id", parsed.values.organization_id)
    .maybeSingle();

  if (!existing) {
    return {
      error: "Transformation not found.",
      values: asFormValues(parsed.values)
    };
  }

  const { error } = await supabase
    .from("transformations")
    .update({
      name: parsed.values.name,
      channel_id: parsed.values.channel_id,
      source_format: parsed.values.input_format,
      target_format: parsed.values.output_format,
      rule_config: parsed.parsedRuleConfig,
      status: parsed.values.is_active === "true" ? "active" : "inactive",
      version: (existing.version ?? 1) + 1,
      updated_by: context.user.id
    })
    .eq("id", transformationId)
    .eq("organization_id", parsed.values.organization_id);

  if (error) {
    return {
      error: getTransformationErrorMessage(error.message),
      values: asFormValues(parsed.values)
    };
  }

  redirect(`/dashboard/transformations/${transformationId}`);
}
