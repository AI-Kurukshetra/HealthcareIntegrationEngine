import { MessageForm } from "@/components/messages/message-form";
import { requireRoleAccess } from "@/lib/auth/guards";
import { adminRoles } from "@/lib/auth/rbac";
import { storeMessageAction } from "@/lib/messages/actions";
import { getMessageChannelOptions } from "@/lib/messages/queries";

export const dynamic = "force-dynamic";

export default async function NewMessagePage() {
  const context = await requireRoleAccess(adminRoles);
  const channels = await getMessageChannelOptions(context.organization.id);

  return <MessageForm action={storeMessageAction} organizationId={context.organization.id} channels={channels} cancelHref="/dashboard/messages" />;
}
