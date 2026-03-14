import { notFound } from "next/navigation";

import { TransformationForm } from "@/components/transformations/transformation-form";
import { requireRoleAccess } from "@/lib/auth/guards";
import { adminRoles } from "@/lib/auth/rbac";
import { updateTransformationAction } from "@/lib/transformations/actions";
import { getTransformationChannelOptions, getTransformationDetails } from "@/lib/transformations/queries";

interface EditTransformationPageProps {
  params: Promise<{
    transformationId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function EditTransformationPage({ params }: EditTransformationPageProps) {
  const { transformationId } = await params;
  const context = await requireRoleAccess(adminRoles);
  const [details, channels] = await Promise.all([
    getTransformationDetails(transformationId, context.organization.id),
    getTransformationChannelOptions(context.organization.id)
  ]);

  if (!details) {
    notFound();
  }

  const action = updateTransformationAction.bind(null, transformationId);

  return (
    <TransformationForm
      title="Edit transformation rule"
      description="Update format mappings and JSON rule config."
      action={action}
      organizationId={context.organization.id}
      channels={channels}
      submitLabel="Save changes"
      pendingLabel="Saving..."
      cancelHref={`/dashboard/transformations/${transformationId}`}
      initialValues={{
        name: details.transformation.name,
        channel_id: details.transformation.channel_id ?? "",
        input_format: details.transformation.source_format,
        output_format: details.transformation.target_format,
        mapping_config: details.mappingConfigPretty,
        is_active: details.isActive ? "true" : "false"
      }}
    />
  );
}
