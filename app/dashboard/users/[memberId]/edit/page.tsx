import { notFound } from "next/navigation";

import { UserForm } from "@/components/users/user-form";
import { requireRoleAccess } from "@/lib/auth/guards";
import { adminRoles } from "@/lib/auth/rbac";
import { updateUserAction } from "@/lib/users/actions";
import { getManageableOrganizationsForUser, getUserDetailsForAdmin } from "@/lib/users/queries";

interface EditUserPageProps {
  params: Promise<{
    memberId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { memberId } = await params;
  const context = await requireRoleAccess(adminRoles);

  const [details, organizations] = await Promise.all([
    getUserDetailsForAdmin(memberId, context.user.id),
    getManageableOrganizationsForUser(context.user.id)
  ]);

  if (!details) {
    notFound();
  }

  const action = updateUserAction.bind(null, memberId);

  return (
    <UserForm
      mode="edit"
      title="Edit user"
      description="Update profile, role, organization, and status for this user."
      action={action}
      organizations={organizations}
      submitLabel="Save changes"
      pendingLabel="Saving..."
      cancelHref="/dashboard/users"
      initialValues={{
        full_name: details.fullName ?? "",
        email: details.email ?? "",
        role: details.role,
        organization_id: details.organizationId,
        status: details.status
      }}
    />
  );
}
