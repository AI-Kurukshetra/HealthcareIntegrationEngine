import { notFound } from "next/navigation";

import { OrganizationForm } from "@/components/organizations/organization-form";
import { adminRoles, hasRole } from "@/lib/auth/rbac";
import { requireRoleAccess } from "@/lib/auth/guards";
import { updateOrganizationAction } from "@/lib/organizations/actions";
import { getOrganizationDetailsForUser } from "@/lib/organizations/queries";

interface EditOrganizationPageProps {
  params: Promise<{
    organizationId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function EditOrganizationPage({ params }: EditOrganizationPageProps) {
  const { organizationId } = await params;
  const context = await requireRoleAccess(adminRoles);
  const details = await getOrganizationDetailsForUser(organizationId, context.user.id);

  if (!details || !hasRole(details.myRole, adminRoles)) {
    notFound();
  }

  const action = updateOrganizationAction.bind(null, organizationId);

  return (
    <OrganizationForm
      title="Edit organization"
      description="Update organization profile details and status."
      action={action}
      submitLabel="Save changes"
      pendingLabel="Saving..."
      cancelHref={`/dashboard/organizations/${organizationId}`}
      initialValues={{
        name: details.organization.name,
        status: details.organization.status
      }}
    />
  );
}
