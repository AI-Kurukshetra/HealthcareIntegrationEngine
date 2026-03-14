import { redirect } from "next/navigation";

import { ChannelForm } from "@/components/channels/channel-form";
import { requireRoleAccess } from "@/lib/auth/guards";
import { adminRoles } from "@/lib/auth/rbac";
import { createChannelAction } from "@/lib/channels/actions";
import { getChannelFormOptions } from "@/lib/channels/queries";

export const dynamic = "force-dynamic";

export default async function NewChannelPage() {
  const context = await requireRoleAccess(adminRoles);
  const { systems, connections } = await getChannelFormOptions(context.organization.id);

  if (systems.length < 2 || connections.length < 1) {
    redirect("/dashboard/connections");
  }

  return (
    <ChannelForm
      title="Create channel"
      description="Configure a channel between source and destination systems."
      action={createChannelAction}
      organizationId={context.organization.id}
      systems={systems}
      connections={connections}
      submitLabel="Create channel"
      pendingLabel="Creating..."
      cancelHref="/dashboard/channels"
      initialValues={{
        direction: "bidirectional",
        is_active: "true"
      }}
    />
  );
}
