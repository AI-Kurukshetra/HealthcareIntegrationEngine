import type { AppRole, MemberStatus } from "@/lib/types/database";

export type UserRoleOption = "admin" | "user";
export type UserStatusOption = "active" | "inactive";

export interface UserFormValues {
  full_name: string;
  email: string;
  password: string;
  role: UserRoleOption;
  organization_id: string;
  status: UserStatusOption;
}

export interface ManagedOrganizationOption {
  id: string;
  name: string;
}

export interface UserListItem {
  memberId: string;
  userId: string;
  fullName: string | null;
  email: string | null;
  role: UserRoleOption;
  organizationId: string;
  organizationName: string;
  status: UserStatusOption;
  createdAt: string;
  rawRole: AppRole;
  rawStatus: MemberStatus;
}

export interface UserDetails {
  memberId: string;
  userId: string;
  fullName: string | null;
  email: string | null;
  role: UserRoleOption;
  organizationId: string;
  organizationName: string;
  status: UserStatusOption;
  rawRole: AppRole;
  rawStatus: MemberStatus;
}

export function toUserRole(role: AppRole): UserRoleOption {
  if (role === "admin" || role === "owner") {
    return "admin";
  }

  return "user";
}

export function fromUserRole(role: UserRoleOption): AppRole {
  return role === "admin" ? "admin" : "viewer";
}

export function toUserStatus(status: MemberStatus): UserStatusOption {
  return status === "active" ? "active" : "inactive";
}

export function fromUserStatus(status: UserStatusOption): MemberStatus {
  return status === "active" ? "active" : "suspended";
}
