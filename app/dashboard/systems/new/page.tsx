import { SystemForm } from "@/components/systems/system-form";
import { requireRoleAccess } from "@/lib/auth/guards";
import { adminRoles } from "@/lib/auth/rbac";
import { createSystemAction } from "@/lib/systems/actions";

export const dynamic = "force-dynamic";

export default async function NewSystemPage() {
  const context = await requireRoleAccess(adminRoles);

  return (
    <SystemForm
      title="Create healthcare system"
      description="Register a source or target system used in your integration workflows."
      action={createSystemAction}
      organizationId={context.organization.id}
      submitLabel="Create system"
      pendingLabel="Creating..."
      cancelHref="/dashboard/systems"
      initialValues={{ status: "active", type: "ehr" }}
    />
  );
}
