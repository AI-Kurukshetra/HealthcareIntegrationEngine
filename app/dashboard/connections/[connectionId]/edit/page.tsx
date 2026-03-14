import { notFound } from "next/navigation";

import { ConnectionForm } from "@/components/connections/connection-form";
import { requireRoleAccess } from "@/lib/auth/guards";
import { adminRoles } from "@/lib/auth/rbac";
import { updateConnectionAction } from "@/lib/connections/actions";
import { getConnectionDetails, getSystemOptions } from "@/lib/connections/queries";

interface EditConnectionPageProps {
  params: Promise<{
    connectionId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function EditConnectionPage({ params }: EditConnectionPageProps) {
  const { connectionId } = await params;
  const context = await requireRoleAccess(adminRoles);
  const [details, systems] = await Promise.all([
    getConnectionDetails(connectionId, context.organization.id),
    getSystemOptions(context.organization.id)
  ]);

  if (!details) {
    notFound();
  }

  const action = updateConnectionAction.bind(null, connectionId);

  return (
    <ConnectionForm
      title="Edit connection"
      description="Update systems, protocol, endpoint, and operational settings for this connection."
      action={action}
      organizationId={context.organization.id}
      systems={systems}
      submitLabel="Save changes"
      pendingLabel="Saving..."
      cancelHref={`/dashboard/connections/${connectionId}`}
      initialValues={{
        source_system_id: details.connection.source_system_id,
        target_system_id: details.connection.target_system_id,
        protocol_type: details.protocolType,
        endpoint: details.endpoint ?? "",
        credentials_placeholder: details.credentialsPlaceholder ?? "",
        status: details.connection.status,
        health_check_interval_minutes: details.healthCheckIntervalMinutes
          ? String(details.healthCheckIntervalMinutes)
          : "5"
      }}
    />
  );
}
