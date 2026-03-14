import { notFound } from "next/navigation";

import { ChannelForm } from "@/components/channels/channel-form";
import { requireRoleAccess } from "@/lib/auth/guards";
import { adminRoles } from "@/lib/auth/rbac";
import { updateChannelAction } from "@/lib/channels/actions";
import { getChannelDetails, getChannelFormOptions } from "@/lib/channels/queries";

interface EditChannelPageProps {
  params: Promise<{
    channelId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function EditChannelPage({ params }: EditChannelPageProps) {
  const { channelId } = await params;
  const context = await requireRoleAccess(adminRoles);
  const [details, options] = await Promise.all([
    getChannelDetails(channelId, context.organization.id),
    getChannelFormOptions(context.organization.id)
  ]);

  if (!details) {
    notFound();
  }

  const action = updateChannelAction.bind(null, channelId);

  return (
    <ChannelForm
      title="Edit channel"
      description="Update channel routing and filtering."
      action={action}
      organizationId={context.organization.id}
      systems={options.systems}
      connections={options.connections}
      submitLabel="Save changes"
      pendingLabel="Saving..."
      cancelHref={`/dashboard/channels/${channelId}`}
      initialValues={{
        name: details.channel.name,
        source_system_id: details.sourceSystemId ?? "",
        destination_system_id: details.destinationSystemId ?? "",
        connection_id: details.connectionId ?? "",
        direction: details.channel.direction,
        is_active: details.isActive ? "true" : "false",
        filtering_rules: details.filteringRules
      }}
    />
  );
}
