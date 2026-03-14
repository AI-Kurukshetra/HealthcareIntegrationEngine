import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { OrganizationMemberRow, OrganizationRow, ProfileRow } from "@/lib/types/database";
import type { AuthContext } from "@/lib/types/domain";

async function ensureProfile(userId: string, email: string | undefined, fullName: string | undefined) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  const profile = (data as ProfileRow | null) ?? null;

  if (profile) {
    if (profile.email !== (email ?? "") || (!profile.full_name && fullName)) {
      await supabase
        .from("profiles")
        .update({
          email: email ?? "",
          full_name: fullName ?? profile.full_name
        })
        .eq("id", userId);
    }

    return profile;
  }

  const { data: inserted } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      email: email ?? "",
      full_name: fullName ?? null
    })
    .select("*")
    .single();

  return inserted as ProfileRow;
}

async function getMembershipForUser(userId: string, currentOrganizationId: string | null) {
  const supabase = await createClient();

  if (currentOrganizationId) {
    const { data } = await supabase
      .from("organization_members")
      .select("*")
      .eq("user_id", userId)
      .eq("organization_id", currentOrganizationId)
      .eq("status", "active")
      .maybeSingle();

    const membership = (data as OrganizationMemberRow | null) ?? null;

    if (membership) {
      return membership;
    }
  }

  const { data: memberships } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1);

  const membership = memberships?.[0] as OrganizationMemberRow | undefined;

  if (membership && membership.organization_id !== currentOrganizationId) {
    await supabase.rpc("set_current_organization", {
      p_organization_id: membership.organization_id
    });
  }

  return membership ?? null;
}

async function getOrganization(organizationId: string | null) {
  if (!organizationId) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", organizationId)
    .maybeSingle();

  return (data as OrganizationRow | null) ?? null;
}

export const getAuthContext = cache(async (): Promise<AuthContext | null> => {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await ensureProfile(user.id, user.email, user.user_metadata.full_name);
  const membership = await getMembershipForUser(user.id, profile.current_organization_id);
  const currentOrganizationId = membership?.organization_id ?? profile.current_organization_id;
  const organization = await getOrganization(currentOrganizationId);

  return {
    user,
    profile: {
      ...profile,
      current_organization_id: currentOrganizationId
    },
    membership,
    organization
  };
});
