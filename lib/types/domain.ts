import type { User } from "@supabase/supabase-js";

import type { AppRole, OrganizationMemberRow, OrganizationRow, ProfileRow } from "@/lib/types/database";

export type SupportedRole = "admin" | "operator" | "viewer";

export interface AuthContext {
  user: User;
  profile: ProfileRow;
  organization: OrganizationRow | null;
  membership: OrganizationMemberRow | null;
}

export interface OrganizationAuthContext extends AuthContext {
  organization: OrganizationRow;
  membership: OrganizationMemberRow;
}

export type RoleCheck = AppRole | SupportedRole;
