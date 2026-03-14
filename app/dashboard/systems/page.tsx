import Link from "next/link";

import { Card } from "@/components/ui/card";
import { adminRoles, hasRole } from "@/lib/auth/rbac";
import { requireOrganizationAccess } from "@/lib/auth/guards";
import { getSystemsForOrganization } from "@/lib/systems/queries";

export const dynamic = "force-dynamic";

export default async function SystemsPage() {
  const context = await requireOrganizationAccess();
  const canManage = hasRole(context.membership.role, adminRoles);
  const systems = await getSystemsForOrganization(context.organization.id);

  return (
    <div className="grid gap-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Systems</p>
            <h1 className="text-2xl font-semibold text-slate-900">Healthcare systems</h1>
            <p className="mt-1 text-sm text-slate-600">Track external and internal systems connected to this organization.</p>
          </div>

          {canManage ? (
            <Link
              href="/dashboard/systems/new"
              className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium !text-white hover:bg-slate-700"
            >
              Create system
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
                <th className="px-4 py-3 font-medium text-slate-600">Type</th>
                <th className="px-4 py-3 font-medium text-slate-600">Vendor</th>
                <th className="px-4 py-3 font-medium text-slate-600">Base URL</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {systems.length ? (
                systems.map((system) => (
                  <tr key={system.id}>
                    <td className="px-4 py-3 text-slate-900">{system.name}</td>
                    <td className="px-4 py-3 uppercase text-slate-700">{system.type}</td>
                    <td className="px-4 py-3 text-slate-700">{system.vendor ?? "n/a"}</td>
                    <td className="px-4 py-3 text-slate-600">{system.baseUrl ?? "n/a"}</td>
                    <td className="px-4 py-3 capitalize text-slate-900">{system.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-3">
                        <Link href={`/dashboard/systems/${system.id}`} className="text-slate-900 underline">
                          View
                        </Link>
                        {canManage ? (
                          <Link href={`/dashboard/systems/${system.id}/edit`} className="text-slate-700 underline">
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
                    No systems added yet.
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
