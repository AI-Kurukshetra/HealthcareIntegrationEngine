"use server";

import { redirect } from "next/navigation";

import type { FormState } from "@/lib/auth/form-state";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { requireRoleAccess } from "@/lib/auth/guards";
import { adminRoles } from "@/lib/auth/rbac";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { OrganizationMemberRow } from "@/lib/types/database";
import { fromUserRole, fromUserStatus, type UserStatusOption } from "@/lib/users/types";
import { validateCreateUserForm, validateUpdateUserForm } from "@/lib/users/validation";

function getField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function asCreateValues(values: {
  full_name: string;
  email: string;
  password: string;
  role: string;
  organization_id: string;
  status: string;
}): Record<string, string> {
  return {
    full_name: values.full_name,
    email: values.email,
    password: values.password,
    role: values.role,
    organization_id: values.organization_id,
    status: values.status
  };
}

function asUpdateValues(values: {
  full_name: string;
  email: string;
  role: string;
  organization_id: string;
  status: string;
}): Record<string, string> {
  return {
    full_name: values.full_name,
    email: values.email,
    role: values.role,
    organization_id: values.organization_id,
    status: values.status
  };
}

async function canManageOrganization(userId: string, organizationId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .maybeSingle();

  const membership = (data as OrganizationMemberRow | null) ?? null;
  return membership ? membership.role === "owner" || membership.role === "admin" : false;
}

async function getManagedMember(memberId: string, actorUserId: string) {
  const supabase = await createClient();
  const { data: memberData } = await supabase.from("organization_members").select("*").eq("id", memberId).maybeSingle();
  const member = (memberData as OrganizationMemberRow | null) ?? null;

  if (!member) {
    return null;
  }

  const allowed = await canManageOrganization(actorUserId, member.organization_id);

  if (!allowed) {
    return null;
  }

  return member;
}

export async function createUserAction(_: FormState, formData: FormData): Promise<FormState> {
  const context = await requireRoleAccess(adminRoles);
  const parsed = validateCreateUserForm({
    full_name: getField(formData, "full_name"),
    email: getField(formData, "email"),
    password: String(formData.get("password") ?? ""),
    role: getField(formData, "role"),
    organization_id: getField(formData, "organization_id"),
    status: getField(formData, "status")
  });

  if (parsed.error) {
    return { error: parsed.error, values: asCreateValues(parsed.values) };
  }

  const canManage = await canManageOrganization(context.user.id, parsed.values.organization_id);

  if (!canManage) {
    return { error: "You cannot manage users for this organization.", values: asCreateValues(parsed.values) };
  }

  const adminClient = createAdminClient();

  if (!adminClient) {
    return {
      error: "Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) in .env.local. Add it and restart the app.",
      values: asCreateValues(parsed.values)
    };
  }

  const appRole = fromUserRole(parsed.values.role);
  const memberStatus = fromUserStatus(parsed.values.status);

  const { data: createdUser, error: createUserError } = await adminClient.auth.admin.createUser({
    email: parsed.values.email,
    password: parsed.values.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.values.full_name
    }
  });

  if (createUserError || !createdUser.user) {
    return {
      error: getAuthErrorMessage(createUserError?.message),
      values: asCreateValues(parsed.values)
    };
  }

  const userId = createdUser.user.id;

  const { error: profileError } = await adminClient
    .from("profiles")
    .upsert(
      {
        id: userId,
        email: parsed.values.email,
        full_name: parsed.values.full_name,
        current_organization_id: parsed.values.organization_id
      },
      {
        onConflict: "id"
      }
    );

  if (profileError) {
    await adminClient.auth.admin.deleteUser(userId);
    return {
      error: getAuthErrorMessage(profileError.message),
      values: asCreateValues(parsed.values)
    };
  }

  const { error: membershipError } = await adminClient.from("organization_members").insert({
    organization_id: parsed.values.organization_id,
    user_id: userId,
    role: appRole,
    status: memberStatus,
    created_by: context.user.id,
    updated_by: context.user.id
  });

  if (membershipError) {
    await adminClient.auth.admin.deleteUser(userId);
    return {
      error: getAuthErrorMessage(membershipError.message),
      values: asCreateValues(parsed.values)
    };
  }

  redirect("/dashboard/users");
}

export async function updateUserAction(memberId: string, _: FormState, formData: FormData): Promise<FormState> {
  const context = await requireRoleAccess(adminRoles);
  const parsed = validateUpdateUserForm({
    full_name: getField(formData, "full_name"),
    email: getField(formData, "email"),
    role: getField(formData, "role"),
    organization_id: getField(formData, "organization_id"),
    status: getField(formData, "status")
  });

  if (parsed.error) {
    return { error: parsed.error, values: asUpdateValues(parsed.values) };
  }

  const existingMember = await getManagedMember(memberId, context.user.id);

  if (!existingMember) {
    return { error: "User membership was not found or is not manageable.", values: asUpdateValues(parsed.values) };
  }

  const canManageTargetOrg = await canManageOrganization(context.user.id, parsed.values.organization_id);

  if (!canManageTargetOrg) {
    return { error: "You cannot move a user to this organization.", values: asUpdateValues(parsed.values) };
  }

  const nextAppRole = fromUserRole(parsed.values.role);
  const nextMemberStatus = fromUserStatus(parsed.values.status);

  if (existingMember.role === "owner" && nextAppRole !== "owner") {
    return { error: "Owner role cannot be changed in this module.", values: asUpdateValues(parsed.values) };
  }

  if (existingMember.role === "owner" && nextMemberStatus !== "active") {
    return { error: "Owner cannot be deactivated.", values: asUpdateValues(parsed.values) };
  }

  if (existingMember.user_id === context.user.id && nextMemberStatus !== "active") {
    return { error: "You cannot deactivate your own account.", values: asUpdateValues(parsed.values) };
  }

  const adminClient = createAdminClient();

  if (!adminClient) {
    return {
      error: "Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) in .env.local. Add it and restart the app.",
      values: asUpdateValues(parsed.values)
    };
  }

  const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(existingMember.user_id, {
    email: parsed.values.email,
    user_metadata: {
      full_name: parsed.values.full_name
    }
  });

  if (authUpdateError) {
    return {
      error: getAuthErrorMessage(authUpdateError.message),
      values: asUpdateValues(parsed.values)
    };
  }

  const { error: profileError } = await adminClient
    .from("profiles")
    .update({
      email: parsed.values.email,
      full_name: parsed.values.full_name,
      current_organization_id: parsed.values.organization_id
    })
    .eq("id", existingMember.user_id);

  if (profileError) {
    return {
      error: getAuthErrorMessage(profileError.message),
      values: asUpdateValues(parsed.values)
    };
  }

  const { error: memberUpdateError } = await adminClient
    .from("organization_members")
    .update({
      organization_id: parsed.values.organization_id,
      role: existingMember.role === "owner" ? "owner" : nextAppRole,
      status: nextMemberStatus,
      updated_by: context.user.id
    })
    .eq("id", memberId);

  if (memberUpdateError) {
    return {
      error: getAuthErrorMessage(memberUpdateError.message),
      values: asUpdateValues(parsed.values)
    };
  }

  redirect("/dashboard/users");
}

export async function setUserActiveStateAction(memberId: string, nextStatus: UserStatusOption) {
  const context = await requireRoleAccess(adminRoles);
  const member = await getManagedMember(memberId, context.user.id);

  if (!member) {
    redirect("/dashboard/users");
  }

  if (member.user_id === context.user.id && nextStatus !== "active") {
    redirect("/dashboard/users?error=cannot-deactivate-self");
  }

  if (member.role === "owner" && nextStatus !== "active") {
    redirect("/dashboard/users?error=owner-cannot-deactivate");
  }

  const adminClient = createAdminClient();

  if (!adminClient) {
    redirect("/dashboard/users?error=missing-service-role-key");
  }

  await adminClient
    .from("organization_members")
    .update({
      status: fromUserStatus(nextStatus),
      updated_by: context.user.id
    })
    .eq("id", memberId);

  redirect("/dashboard/users");
}
