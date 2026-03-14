import Link from "next/link";

import { TransformationActiveBadge } from "@/components/transformations/transformation-active-badge";
import { Card } from "@/components/ui/card";
import { adminRoles, hasRole } from "@/lib/auth/rbac";
import { requireOrganizationAccess } from "@/lib/auth/guards";
import { getTransformationsForOrganization } from "@/lib/transformations/queries";

export const dynamic = "force-dynamic";

export default async function TransformationsPage() {
  const context = await requireOrganizationAccess();
  const canManage = hasRole(context.membership.role, adminRoles);
  const transformations = await getTransformationsForOrganization(context.organization.id);

  return (
    <div className="grid gap-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Transformations</p>
            <h1 className="text-2xl font-semibold text-slate-900">Transformation rules</h1>
            <p className="mt-1 text-sm text-slate-600">Manage simple rule-based transformations linked to channels.</p>
          </div>
          {canManage ? (
            <Link
              href="/dashboard/transformations/new"
              className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium !text-white hover:bg-slate-700"
            >
              Create rule
            </Link>
          ) : null}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 font-medium text-slate-600">Channel</th>
                <th className="px-4 py-3 font-medium text-slate-600">Input</th>
                <th className="px-4 py-3 font-medium text-slate-600">Output</th>
                <th className="px-4 py-3 font-medium text-slate-600">Active</th>
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {transformations.length ? (
                transformations.map((rule) => (
                  <tr key={rule.id}>
                    <td className="px-4 py-3 text-slate-900">
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-xs text-slate-500">v{rule.version}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{rule.channelName ?? "n/a"}</td>
                    <td className="px-4 py-3 text-slate-900">{rule.inputFormat}</td>
                    <td className="px-4 py-3 text-slate-900">{rule.outputFormat}</td>
                    <td className="px-4 py-3">
                      <TransformationActiveBadge isActive={rule.isActive} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-3">
                        <Link href={`/dashboard/transformations/${rule.id}`} className="text-slate-900 underline">
                          View
                        </Link>
                        {canManage ? (
                          <Link href={`/dashboard/transformations/${rule.id}/edit`} className="text-slate-700 underline">
                            Edit
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No transformation rules available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
