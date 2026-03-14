import { redirect } from "next/navigation";

import { ConnectionForm } from "@/components/connections/connection-form";
import { requireRoleAccess } from "@/lib/auth/guards";
import { adminRoles } from "@/lib/auth/rbac";
import { createConnectionAction } from "@/lib/connections/actions";
import { getSystemOptions } from "@/lib/connections/queries";

export const dynamic = "force-dynamic";

export default async function NewConnectionPage() {
  const context = await requireRoleAccess(adminRoles);
  const systems = await getSystemOptions(context.organization.id);

  if (systems.length < 2) {
    redirect("/dashboard/systems");
  }

  return (
    <ConnectionForm
      title="Create connection"
      description="Create a secure connection between two systems using protocol, endpoint, and health check configuration."
      action={createConnectionAction}
      organizationId={context.organization.id}
      systems={systems}
      submitLabel="Create connection"
      pendingLabel="Creating..."
      cancelHref="/dashboard/connections"
    />
  );
}
