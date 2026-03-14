import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { adminRoles, hasRole } from "@/lib/auth/rbac";
import { requireOrganizationAccess } from "@/lib/auth/guards";
import { getSystemDetails } from "@/lib/systems/queries";

interface SystemDetailsPageProps {
  params: Promise<{
    systemId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function SystemDetailsPage({ params }: SystemDetailsPageProps) {
  const { systemId } = await params;
  const context = await requireOrganizationAccess();
  const canManage = hasRole(context.membership.role, adminRoles);
  const details = await getSystemDetails(systemId, context.organization.id);

  if (!details) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">System details</p>
            <h1 className="text-2xl font-semibold text-slate-900">{details.system.name}</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            {canManage ? (
              <Link
                href={`/dashboard/systems/${details.system.id}/edit`}
                className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium !text-white hover:bg-slate-700"
              >
                Edit system
              </Link>
            ) : null}
            <Link
              href="/dashboard/systems"
              className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Back to list
            </Link>
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Type</dt>
            <dd className="mt-1 text-sm uppercase text-slate-900">{details.system.system_type}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Vendor</dt>
            <dd className="mt-1 text-sm text-slate-900">{details.system.vendor ?? "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Base URL</dt>
            <dd className="mt-1 text-sm break-all text-slate-900">{details.baseUrl ?? "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Status</dt>
            <dd className="mt-1 text-sm capitalize text-slate-900">{details.system.status}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm text-slate-500">Organization id</dt>
            <dd className="mt-1 text-sm break-all text-slate-900">{details.system.organization_id}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm text-slate-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-900">{details.notes || "No notes added."}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
