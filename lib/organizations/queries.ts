import { createClient } from "@/lib/supabase/server";
import type { OrganizationMemberRow, OrganizationRow, ProfileRow } from "@/lib/types/database";

import { toProfileMap, type OrganizationDetails, type OrganizationListItem } from "@/lib/organizations/types";

function buildMemberCounts(rows: OrganizationMemberRow[]) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const current = counts.get(row.organization_id) ?? 0;
    counts.set(row.organization_id, current + 1);
  }

  return counts;
}

export async function getOrganizationsForUser(userId: string): Promise<OrganizationListItem[]> {
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  const membershipRows = (memberships ?? []) as OrganizationMemberRow[];
  const organizationIds = membershipRows.map((membership) => membership.organization_id);

  if (!organizationIds.length) {
    return [];
  }

  const { data: organizations } = await supabase
    .from("organizations")
    .select("*")
    .in("id", organizationIds)
    .order("name", { ascending: true });

  const organizationRows = (organizations ?? []) as OrganizationRow[];

  const { data: allMembers } = await supabase
    .from("organization_members")
    .select("*")
    .in("organization_id", organizationIds)
    .eq("status", "active");

  const memberCounts = buildMemberCounts((allMembers ?? []) as OrganizationMemberRow[]);
  const membershipMap = new Map(membershipRows.map((membership) => [membership.organization_id, membership]));

  return organizationRows
    .map((organization) => {
      const membership = membershipMap.get(organization.id);

      if (!membership) {
        return null;
      }

      return {
        organization,
        myRole: membership.role,
        memberCount: memberCounts.get(organization.id) ?? 0
      };
    })
    .filter((item): item is OrganizationListItem => item !== null);
}

export async function getOrganizationDetailsForUser(
  organizationId: string,
  userId: string
): Promise<OrganizationDetails | null> {
  const supabase = await createClient();

  const { data: myMembership } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  const membership = (myMembership as OrganizationMemberRow | null) ?? null;

  if (!membership) {
    return null;
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", organizationId)
    .maybeSingle();

  if (!organization) {
    return null;
  }

  const { data: members } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });

  const memberRows = (members ?? []) as OrganizationMemberRow[];
  const userIds = memberRows.map((member) => member.user_id);

  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("*").in("id", userIds)
    : { data: [] as ProfileRow[] };

  const profileMap = toProfileMap((profiles ?? []) as ProfileRow[]);

  return {
    organization: organization as OrganizationRow,
    myRole: membership.role,
    members: memberRows.map((member) => {
      const profile = profileMap.get(member.user_id);

      return {
        memberId: member.id,
        userId: member.user_id,
        role: member.role,
        status: member.status,
        fullName: profile?.full_name ?? null,
        email: profile?.email ?? null,
        joinedAt: member.created_at
      };
    })
  };
}
