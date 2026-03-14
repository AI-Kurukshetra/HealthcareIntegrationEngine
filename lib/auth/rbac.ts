import type { AppRole } from "@/lib/types/database";
import type { SupportedRole } from "@/lib/types/domain";

const roleRank: Record<AppRole, number> = {
  viewer: 10,
  operator: 20,
  admin: 30,
  owner: 40
};

export const viewerRoles: AppRole[] = ["viewer", "operator", "admin", "owner"];
export const operatorRoles: AppRole[] = ["operator", "admin", "owner"];
export const adminRoles: AppRole[] = ["admin", "owner"];
export const ownerRoles: AppRole[] = ["owner"];

export function hasRole(role: AppRole | null | undefined, allowedRoles: Array<SupportedRole | AppRole>) {
  if (!role) {
    return false;
  }

  return allowedRoles.some((allowedRole) => roleRank[role] >= roleRank[allowedRole as AppRole]);
}
