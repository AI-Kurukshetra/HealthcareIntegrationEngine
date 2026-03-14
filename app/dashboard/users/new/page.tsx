import Link from "next/link";

import { UserForm } from "@/components/users/user-form";
import { Card } from "@/components/ui/card";
import { requireRoleAccess } from "@/lib/auth/guards";
import { adminRoles } from "@/lib/auth/rbac";
import { createUserAction } from "@/lib/users/actions";
import { getManageableOrganizationsForUser } from "@/lib/users/queries";

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  const context = await requireRoleAccess(adminRoles);
  const organizations = await getManageableOrganizationsForUser(context.user.id);

  if (!organizations.length) {
    return (
      <Card className="max-w-2xl space-y-3">
        <h1 className="text-2xl font-semibold text-slate-900">Create user</h1>
        <p className="text-sm text-slate-600">No manageable organizations found for your account.</p>
        <Link href="/dashboard/users" className="inline-flex min-h-11 items-center text-sm font-medium text-slate-900 underline">
          Back to users
        </Link>
      </Card>
    );
  }

  return (
    <UserForm
      mode="create"
      title="Create user"
      description="Create a sub user and assign role, organization, and status."
      action={createUserAction}
      organizations={organizations}
      submitLabel="Create user"
      pendingLabel="Creating user..."
      cancelHref="/dashboard/users"
      initialValues={{
        role: "user",
        status: "active",
        organization_id: organizations[0]?.id
      }}
    />
  );
}
