import { OrganizationForm } from "@/components/organizations/organization-form";
import { adminRoles } from "@/lib/auth/rbac";
import { requireRoleAccess } from "@/lib/auth/guards";
import { createOrganizationAction } from "@/lib/organizations/actions";

export const dynamic = "force-dynamic";

export default async function NewOrganizationPage() {
  await requireRoleAccess(adminRoles);

  return (
    <OrganizationForm
      title="Create organization"
      description="Create a new organization workspace and assign yourself as admin."
      action={createOrganizationAction}
      submitLabel="Create organization"
      pendingLabel="Creating organization..."
      cancelHref="/dashboard/organizations"
      initialValues={{ status: "active" }}
    />
  );
}
