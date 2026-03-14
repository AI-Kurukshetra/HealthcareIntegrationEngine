"use server";

import { redirect } from "next/navigation";

import { adminRoles, hasRole } from "@/lib/auth/rbac";
import { requireRoleAccess } from "@/lib/auth/guards";
import type { FormState } from "@/lib/auth/form-state";
import type { OrganizationFormValues } from "@/lib/organizations/types";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, MemberStatus } from "@/lib/types/database";
import { getOrganizationErrorMessage, validateOrganizationForm } from "@/lib/organizations/validation";

function getField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function asFormStateValues(values: OrganizationFormValues): Record<string, string> {
  return {
    name: values.name,
    slug: values.slug,
    status: values.status
  };
}

function parseMemberRole(value: string): AppRole | null {
  if (value === "owner" || value === "admin" || value === "operator" || value === "viewer") {
    return value;
  }

  return null;
}

function parseMemberStatus(value: string): MemberStatus | null {
  if (value === "active" || value === "invited" || value === "suspended") {
    return value;
  }

  return null;
}

export async function createOrganizationAction(_: FormState, formData: FormData): Promise<FormState> {
  const context = await requireRoleAccess(adminRoles);
  const parsed = validateOrganizationForm({
    name: getField(formData, "name"),
    status: getField(formData, "status")
  });

  if (parsed.error) {
    return {
      error: parsed.error,
      values: asFormStateValues(parsed.values)
    };
  }

  const supabase = await createClient();
  const { data: organizationId, error: createOrgError } = await supabase.rpc("create_organization", {
    p_name: parsed.values.name,
    p_status: parsed.values.status
  });

  if (createOrgError || !organizationId) {
    return {
      error: getOrganizationErrorMessage(createOrgError?.message),
      values: asFormStateValues(parsed.values)
    };
  }
  redirect(`/dashboard/organizations/${organizationId}`);
}

export async function updateOrganizationAction(
  organizationId: string,
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const context = await requireRoleAccess(adminRoles);
  const parsed = validateOrganizationForm({
    name: getField(formData, "name"),
    status: getField(formData, "status")
  });

  if (parsed.error) {
    return {
      error: parsed.error,
      values: asFormStateValues(parsed.values)
    };
  }

  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("user_id", context.user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership || !hasRole(membership.role, adminRoles)) {
    return {
      error: "You do not have permission to edit this organization.",
      values: asFormStateValues(parsed.values)
    };
  }

  const { error: updateError } = await supabase
    .from("organizations")
    .update({
      name: parsed.values.name,
      slug: parsed.values.slug,
      status: parsed.values.status,
      updated_by: context.user.id
    })
    .eq("id", organizationId);

  if (updateError) {
    return {
      error: getOrganizationErrorMessage(updateError.message),
      values: asFormStateValues(parsed.values)
    };
  }

  redirect(`/dashboard/organizations/${organizationId}`);
}

export async function updateOrganizationMemberAction(organizationId: string, memberId: string, formData: FormData) {
  const context = await requireRoleAccess(adminRoles);
  const supabase = await createClient();
  const role = parseMemberRole(getField(formData, "role"));
  const status = parseMemberStatus(getField(formData, "status"));

  if (!role || !status) {
    redirect(`/dashboard/organizations/${organizationId}?error=invalid-member-input`);
  }

  const { data: actorMembership } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("user_id", context.user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!actorMembership || !hasRole(actorMembership.role, adminRoles)) {
    redirect(`/dashboard/organizations/${organizationId}?error=forbidden`);
  }

  const { data: targetMember } = await supabase
    .from("organization_members")
    .select("*")
    .eq("id", memberId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!targetMember) {
    redirect(`/dashboard/organizations/${organizationId}?error=member-not-found`);
  }

  if (targetMember.user_id === context.user.id) {
    redirect(`/dashboard/organizations/${organizationId}?error=cannot-edit-self`);
  }

  if (actorMembership.role !== "owner" && (targetMember.role === "owner" || role === "owner")) {
    redirect(`/dashboard/organizations/${organizationId}?error=owner-only-change`);
  }

  if (targetMember.role === "owner" && (role !== "owner" || status !== "active")) {
    const { count: ownerCount } = await supabase
      .from("organization_members")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("role", "owner")
      .eq("status", "active");

    if ((ownerCount ?? 0) <= 1) {
      redirect(`/dashboard/organizations/${organizationId}?error=last-owner`);
    }
  }

  await supabase
    .from("organization_members")
    .update({
      role,
      status,
      updated_by: context.user.id
    })
    .eq("id", memberId)
    .eq("organization_id", organizationId);

  redirect(`/dashboard/organizations/${organizationId}`);
}

export async function removeOrganizationMemberAction(organizationId: string, memberId: string) {
  const context = await requireRoleAccess(adminRoles);
  const supabase = await createClient();

  const { data: actorMembership } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("user_id", context.user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!actorMembership || !hasRole(actorMembership.role, adminRoles)) {
    redirect(`/dashboard/organizations/${organizationId}?error=forbidden`);
  }

  const { data: targetMember } = await supabase
    .from("organization_members")
    .select("*")
    .eq("id", memberId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!targetMember) {
    redirect(`/dashboard/organizations/${organizationId}?error=member-not-found`);
  }

  if (targetMember.user_id === context.user.id) {
    redirect(`/dashboard/organizations/${organizationId}?error=cannot-remove-self`);
  }

  if (actorMembership.role !== "owner" && targetMember.role === "owner") {
    redirect(`/dashboard/organizations/${organizationId}?error=owner-only-change`);
  }

  if (targetMember.role === "owner" && targetMember.status === "active") {
    const { count: ownerCount } = await supabase
      .from("organization_members")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("role", "owner")
      .eq("status", "active");

    if ((ownerCount ?? 0) <= 1) {
      redirect(`/dashboard/organizations/${organizationId}?error=last-owner`);
    }
  }

  await supabase.from("organization_members").delete().eq("id", memberId).eq("organization_id", organizationId);

  redirect(`/dashboard/organizations/${organizationId}`);
}

export async function deleteOrganizationAction(organizationId: string) {
  const context = await requireRoleAccess(adminRoles);
  const supabase = await createClient();

  const { data: actorMembership } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("user_id", context.user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!actorMembership || actorMembership.role !== "owner") {
    redirect(`/dashboard/organizations/${organizationId}?error=owner-only-delete`);
  }

  const { data: otherMemberships } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", context.user.id)
    .eq("status", "active")
    .neq("organization_id", organizationId)
    .order("created_at", { ascending: true })
    .limit(1);

  const nextMembership = otherMemberships?.[0] ?? null;

  await supabase.from("organizations").delete().eq("id", organizationId);

  if (nextMembership) {
    await supabase.rpc("set_current_organization", {
      p_organization_id: nextMembership.organization_id
    });
  } else {
    await supabase
      .from("profiles")
      .update({
        current_organization_id: null
      })
      .eq("id", context.user.id);
  }

  redirect("/dashboard/organizations");
}
