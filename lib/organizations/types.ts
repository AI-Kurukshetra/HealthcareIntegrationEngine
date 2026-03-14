import type { AppRole, MemberStatus, OrganizationRow, ProfileRow } from "@/lib/types/database";

export interface OrganizationListItem {
  organization: OrganizationRow;
  myRole: AppRole;
  memberCount: number;
}

export interface OrganizationMemberWithProfile {
  memberId: string;
  userId: string;
  role: AppRole;
  status: MemberStatus;
  fullName: string | null;
  email: string | null;
  joinedAt: string;
}

export interface OrganizationDetails {
  organization: OrganizationRow;
  myRole: AppRole;
  members: OrganizationMemberWithProfile[];
}

export interface OrganizationFormValues {
  name: string;
  slug: string;
  status: OrganizationRow["status"];
}

export function toProfileMap(profiles: ProfileRow[]) {
  return new Map(profiles.map((profile) => [profile.id, profile]));
}
