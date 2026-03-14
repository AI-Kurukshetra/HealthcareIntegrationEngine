import { redirect } from "next/navigation";

import { hasRole } from "@/lib/auth/rbac";
import { getAuthContext } from "@/lib/auth/session";
import type { AppRole } from "@/lib/types/database";
import type { AuthContext, OrganizationAuthContext } from "@/lib/types/domain";

export async function requireAuthenticatedUser(): Promise<AuthContext> {
  const context = await getAuthContext();

  if (!context) {
    redirect("/login");
  }

  return context;
}

export async function requireOrganizationAccess(): Promise<OrganizationAuthContext> {
  const context = await requireAuthenticatedUser();

  if (!context.organization || !context.membership) {
    redirect("/onboarding/organization");
  }

  return context as OrganizationAuthContext;
}

export async function requireRoleAccess(allowedRoles: AppRole[]): Promise<OrganizationAuthContext> {
  const context = await requireOrganizationAccess();

  if (!hasRole(context.membership.role, allowedRoles)) {
    redirect("/forbidden");
  }

  return context;
}
