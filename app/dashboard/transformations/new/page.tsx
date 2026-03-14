import { redirect } from "next/navigation";

import { TransformationForm } from "@/components/transformations/transformation-form";
import { requireRoleAccess } from "@/lib/auth/guards";
import { adminRoles } from "@/lib/auth/rbac";
import { createTransformationAction } from "@/lib/transformations/actions";
import { getTransformationChannelOptions } from "@/lib/transformations/queries";

export const dynamic = "force-dynamic";

export default async function NewTransformationPage() {
  const context = await requireRoleAccess(adminRoles);
  const channels = await getTransformationChannelOptions(context.organization.id);

  if (!channels.length) {
    redirect("/dashboard/channels");
  }

  return (
    <TransformationForm
      title="Create transformation rule"
      description="Define simple JSON-based mapping rules. Visual mapper is not included in MVP."
      action={createTransformationAction}
      organizationId={context.organization.id}
      channels={channels}
      submitLabel="Create rule"
      pendingLabel="Creating..."
      cancelHref="/dashboard/transformations"
      initialValues={{
        is_active: "true",
        mapping_config: "{}"
      }}
    />
  );
}
