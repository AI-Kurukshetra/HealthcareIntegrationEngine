import Link from "next/link";

import { ConnectionStatusBadge } from "@/components/connections/connection-status-badge";
import { Card } from "@/components/ui/card";
import { setConnectionStatusAction } from "@/lib/connections/actions";
import { adminRoles, hasRole } from "@/lib/auth/rbac";
import { requireOrganizationAccess } from "@/lib/auth/guards";
import { getConnectionListForOrganization } from "@/lib/connections/queries";

export const dynamic = "force-dynamic";

export default async function ConnectionsPage() {
  const context = await requireOrganizationAccess();
  const canCreate = hasRole(context.membership.role, adminRoles);
  const connections = await getConnectionListForOrganization(context.organization.id);

  return (
    <div className="grid gap-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Connections</p>
            <h1 className="text-2xl font-semibold text-slate-900">System connections</h1>
            <p className="mt-1 text-sm text-slate-600">Manage protocol and endpoint links between source and target systems.</p>
          </div>

          {canCreate ? (
            <Link
              href="/dashboard/connections/new"
              className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium !text-white hover:bg-slate-700"
            >
              Create connection
            </Link>
          ) : null}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Connection</th>
                <th className="px-4 py-3 font-medium text-slate-600">Protocol</th>
                <th className="px-4 py-3 font-medium text-slate-600">Endpoint</th>
                <th className="px-4 py-3 font-medium text-slate-600">Health check</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {connections.length ? (
                connections.map((connection) => (
                  <tr key={connection.id}>
                    <td className="px-4 py-3 text-slate-900">
                      <p className="font-medium">{connection.name}</p>
                      <p className="text-xs text-slate-500">
                        {connection.sourceSystemName} {"->"} {connection.targetSystemName}
                      </p>
                    </td>
                    <td className="px-4 py-3 uppercase text-slate-700">{connection.protocolType}</td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-600">{connection.endpoint ?? "n/a"}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {connection.healthCheckIntervalMinutes ? `${connection.healthCheckIntervalMinutes} min` : "n/a"}
                    </td>
                    <td className="px-4 py-3">
                      <ConnectionStatusBadge status={connection.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-3">
                        <Link href={`/dashboard/connections/${connection.id}`} className="text-slate-900 underline">
                          View
                        </Link>
                        {canCreate ? (
                          <Link href={`/dashboard/connections/${connection.id}/edit`} className="text-slate-700 underline">
                            Edit
                          </Link>
                        ) : null}
                        {canCreate ? (
                          connection.status === "active" ? (
                            <form action={setConnectionStatusAction.bind(null, connection.id, "paused")}>
                              <button type="submit" className="text-amber-700 underline">
                                Pause
                              </button>
                            </form>
                          ) : (
                            <form action={setConnectionStatusAction.bind(null, connection.id, "active")}>
                              <button type="submit" className="text-emerald-700 underline">
                                Resume
                              </button>
                            </form>
                          )
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No connections created yet.
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
