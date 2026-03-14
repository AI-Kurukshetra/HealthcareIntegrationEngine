import { notFound } from "next/navigation";

import { SystemForm } from "@/components/systems/system-form";
import { requireRoleAccess } from "@/lib/auth/guards";
import { adminRoles } from "@/lib/auth/rbac";
import { updateSystemAction } from "@/lib/systems/actions";
import { getSystemDetails } from "@/lib/systems/queries";

interface EditSystemPageProps {
  params: Promise<{
    systemId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function EditSystemPage({ params }: EditSystemPageProps) {
  const { systemId } = await params;
  const context = await requireRoleAccess(adminRoles);
  const details = await getSystemDetails(systemId, context.organization.id);

  if (!details) {
    notFound();
  }

  const action = updateSystemAction.bind(null, systemId);

  return (
    <SystemForm
      title="Edit healthcare system"
      description="Update system metadata and connectivity details."
      action={action}
      organizationId={context.organization.id}
      submitLabel="Save changes"
      pendingLabel="Saving..."
      cancelHref={`/dashboard/systems/${systemId}`}
      initialValues={{
        name: details.system.name,
        type: details.system.system_type,
        vendor: details.system.vendor ?? "",
        base_url: details.baseUrl ?? "",
        notes: details.notes ?? "",
        status: details.system.status
      }}
    />
  );
}
