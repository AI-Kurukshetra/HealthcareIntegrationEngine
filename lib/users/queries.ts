import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrganizationMemberRow, OrganizationRow, ProfileRow } from "@/lib/types/database";
import {
  toUserRole,
  toUserStatus,
  type ManagedOrganizationOption,
  type UserDetails,
  type UserListItem
} from "@/lib/users/types";

function isAdminLikeRole(role: OrganizationMemberRow["role"]) {
  return role === "owner" || role === "admin";
}

async function getManageableOrganizationIds(userId: string) {
  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active");

  const memberRows = (memberships ?? []) as OrganizationMemberRow[];

  return memberRows.filter((membership) => isAdminLikeRole(membership.role)).map((membership) => membership.organization_id);
}

export async function getManageableOrganizationsForUser(userId: string): Promise<ManagedOrganizationOption[]> {
  const supabase = await createClient();
  const organizationIds = await getManageableOrganizationIds(userId);

  if (!organizationIds.length) {
    return [];
  }

  const { data: organizations } = await supabase
    .from("organizations")
    .select("*")
    .in("id", organizationIds)
    .order("name", { ascending: true });

  return ((organizations ?? []) as OrganizationRow[]).map((organization) => ({
    id: organization.id,
    name: organization.name
  }));
}

export async function getUsersForAdmin(actorUserId: string): Promise<UserListItem[]> {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  const organizationIds = await getManageableOrganizationIds(actorUserId);

  if (!organizationIds.length) {
    return [];
  }

  const [{ data: members }, { data: organizations }] = await Promise.all([
    supabase
      .from("organization_members")
      .select("*")
      .in("organization_id", organizationIds)
      .order("created_at", { ascending: false }),
    supabase.from("organizations").select("*").in("id", organizationIds)
  ]);

  const memberRows = (members ?? []) as OrganizationMemberRow[];
  const organizationMap = new Map(((organizations ?? []) as OrganizationRow[]).map((row) => [row.id, row]));

  const userIds = Array.from(new Set(memberRows.map((member) => member.user_id)));
  const profileReader = adminClient ?? supabase;
  const { data: profiles } = userIds.length
    ? await profileReader.from("profiles").select("*").in("id", userIds)
    : { data: [] as ProfileRow[] };
  const profileMap = new Map(((profiles ?? []) as ProfileRow[]).map((row) => [row.id, row]));

  return memberRows
    .map((member) => {
      const profile = profileMap.get(member.user_id) ?? null;
      const organization = organizationMap.get(member.organization_id) ?? null;

      if (!organization) {
        return null;
      }

      return {
        memberId: member.id,
        userId: member.user_id,
        fullName: profile?.full_name ?? null,
        email: profile?.email ?? null,
        role: toUserRole(member.role),
        organizationId: organization.id,
        organizationName: organization.name,
        status: toUserStatus(member.status),
        createdAt: member.created_at,
        rawRole: member.role,
        rawStatus: member.status
      };
    })
    .filter((item): item is UserListItem => item !== null);
}

export async function getUserDetailsForAdmin(memberId: string, actorUserId: string): Promise<UserDetails | null> {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  const organizationIds = await getManageableOrganizationIds(actorUserId);

  if (!organizationIds.length) {
    return null;
  }

  const { data: memberData } = await supabase
    .from("organization_members")
    .select("*")
    .eq("id", memberId)
    .in("organization_id", organizationIds)
    .maybeSingle();

  const member = (memberData as OrganizationMemberRow | null) ?? null;

  if (!member) {
    return null;
  }

  const profileReader = adminClient ?? supabase;
  const [{ data: profileData }, { data: organizationData }] = await Promise.all([
    profileReader.from("profiles").select("*").eq("id", member.user_id).maybeSingle(),
    supabase.from("organizations").select("*").eq("id", member.organization_id).maybeSingle()
  ]);

  const profile = (profileData as ProfileRow | null) ?? null;
  const organization = (organizationData as OrganizationRow | null) ?? null;

  if (!organization) {
    return null;
  }

  return {
    memberId: member.id,
    userId: member.user_id,
    fullName: profile?.full_name ?? null,
    email: profile?.email ?? null,
    role: toUserRole(member.role),
    organizationId: organization.id,
    organizationName: organization.name,
    status: toUserStatus(member.status),
    rawRole: member.role,
    rawStatus: member.status
  };
}
