"use server";

import { redirect } from "next/navigation";

import type { FormState } from "@/lib/auth/form-state";
import { requireRoleAccess } from "@/lib/auth/guards";
import { adminRoles } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { type SystemFormValues } from "@/lib/systems/types";
import { getSystemErrorMessage, slugifySystemName, validateSystemForm } from "@/lib/systems/validation";

function getField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function asFormStateValues(values: SystemFormValues): Record<string, string> {
  return {
    name: values.name,
    type: values.type,
    vendor: values.vendor,
    base_url: values.base_url,
    notes: values.notes,
    organization_id: values.organization_id,
    status: values.status
  };
}

export async function createSystemAction(_: FormState, formData: FormData): Promise<FormState> {
  await requireRoleAccess(adminRoles);
  const parsed = validateSystemForm({
    name: getField(formData, "name"),
    type: getField(formData, "type"),
    vendor: getField(formData, "vendor"),
    base_url: getField(formData, "base_url"),
    notes: getField(formData, "notes"),
    organization_id: getField(formData, "organization_id"),
    status: getField(formData, "status")
  });

  if (parsed.error) {
    return {
      error: parsed.error,
      values: asFormStateValues(parsed.values)
    };
  }

  const supabase = await createClient();
  const { data: created, error } = await supabase
    .from("systems")
    .insert({
      organization_id: parsed.values.organization_id,
      name: parsed.values.name,
      slug: slugifySystemName(parsed.values.name),
      system_type: parsed.values.type,
      vendor: parsed.values.vendor || null,
      description: parsed.values.notes || null,
      status: parsed.values.status,
      config: parsed.values.base_url ? { base_url: parsed.values.base_url } : {}
    })
    .select("*")
    .single();

  if (error) {
    return {
      error: getSystemErrorMessage(error.message),
      values: asFormStateValues(parsed.values)
    };
  }

  redirect(`/dashboard/systems/${created.id}`);
}

export async function updateSystemAction(systemId: string, _: FormState, formData: FormData): Promise<FormState> {
  await requireRoleAccess(adminRoles);
  const parsed = validateSystemForm({
    name: getField(formData, "name"),
    type: getField(formData, "type"),
    vendor: getField(formData, "vendor"),
    base_url: getField(formData, "base_url"),
    notes: getField(formData, "notes"),
    organization_id: getField(formData, "organization_id"),
    status: getField(formData, "status")
  });

  if (parsed.error) {
    return {
      error: parsed.error,
      values: asFormStateValues(parsed.values)
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("systems")
    .update({
      name: parsed.values.name,
      slug: slugifySystemName(parsed.values.name),
      system_type: parsed.values.type,
      vendor: parsed.values.vendor || null,
      description: parsed.values.notes || null,
      status: parsed.values.status,
      config: parsed.values.base_url ? { base_url: parsed.values.base_url } : {}
    })
    .eq("id", systemId)
    .eq("organization_id", parsed.values.organization_id);

  if (error) {
    return {
      error: getSystemErrorMessage(error.message),
      values: asFormStateValues(parsed.values)
    };
  }

  redirect(`/dashboard/systems/${systemId}`);
}
