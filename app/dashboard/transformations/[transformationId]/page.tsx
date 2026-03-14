import Link from "next/link";
import { notFound } from "next/navigation";

import { TransformationActiveBadge } from "@/components/transformations/transformation-active-badge";
import { Card } from "@/components/ui/card";
import { adminRoles, hasRole } from "@/lib/auth/rbac";
import { requireOrganizationAccess } from "@/lib/auth/guards";
import { getTransformationDetails } from "@/lib/transformations/queries";

interface TransformationDetailsPageProps {
  params: Promise<{
    transformationId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function TransformationDetailsPage({ params }: TransformationDetailsPageProps) {
  const { transformationId } = await params;
  const context = await requireOrganizationAccess();
  const canManage = hasRole(context.membership.role, adminRoles);
  const details = await getTransformationDetails(transformationId, context.organization.id);

  if (!details) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Transformation details</p>
            <h1 className="text-2xl font-semibold text-slate-900">{details.transformation.name}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <TransformationActiveBadge isActive={details.isActive} />
            {canManage ? (
              <Link
                href={`/dashboard/transformations/${details.transformation.id}/edit`}
                className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium !text-white hover:bg-slate-700"
              >
                Edit rule
              </Link>
            ) : null}
            <Link
              href="/dashboard/transformations"
              className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Back to list
            </Link>
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Channel</dt>
            <dd className="mt-1 text-sm text-slate-900">{details.channelName ?? "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Version</dt>
            <dd className="mt-1 text-sm text-slate-900">{details.transformation.version}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Input format</dt>
            <dd className="mt-1 text-sm text-slate-900">{details.transformation.source_format}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Output format</dt>
            <dd className="mt-1 text-sm text-slate-900">{details.transformation.target_format}</dd>
          </div>
        </dl>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Mapping config</h2>
        <pre className="max-h-[560px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800">
          {details.mappingConfigPretty}
        </pre>
      </Card>
    </div>
  );
}
