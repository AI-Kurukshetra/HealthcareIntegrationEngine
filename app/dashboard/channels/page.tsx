import Link from "next/link";

import { ChannelActiveBadge } from "@/components/channels/channel-active-badge";
import { Card } from "@/components/ui/card";
import { adminRoles, hasRole } from "@/lib/auth/rbac";
import { requireOrganizationAccess } from "@/lib/auth/guards";
import { getChannelsForOrganization } from "@/lib/channels/queries";

export const dynamic = "force-dynamic";

export default async function ChannelsPage() {
  const context = await requireOrganizationAccess();
  const canManage = hasRole(context.membership.role, adminRoles);
  const channels = await getChannelsForOrganization(context.organization.id);

  return (
    <div className="grid gap-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Channels</p>
            <h1 className="text-2xl font-semibold text-slate-900">Integration channels</h1>
            <p className="mt-1 text-sm text-slate-600">Channels connect source systems to destination systems through a connection path.</p>
          </div>
          {canManage ? (
            <Link
              href="/dashboard/channels/new"
              className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium !text-white hover:bg-slate-700"
            >
              Create channel
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
                <th className="px-4 py-3 font-medium text-slate-600">Source</th>
                <th className="px-4 py-3 font-medium text-slate-600">Destination</th>
                <th className="px-4 py-3 font-medium text-slate-600">Direction</th>
                <th className="px-4 py-3 font-medium text-slate-600">Active</th>
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {channels.length ? (
                channels.map((channel) => (
                  <tr key={channel.id}>
                    <td className="px-4 py-3 text-slate-900">{channel.name}</td>
                    <td className="px-4 py-3 text-slate-700">{channel.sourceSystemName ?? "n/a"}</td>
                    <td className="px-4 py-3 text-slate-700">{channel.destinationSystemName ?? "n/a"}</td>
                    <td className="px-4 py-3 capitalize text-slate-900">{channel.direction}</td>
                    <td className="px-4 py-3">
                      <ChannelActiveBadge isActive={channel.isActive} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-3">
                        <Link href={`/dashboard/channels/${channel.id}`} className="text-slate-900 underline">
                          View
                        </Link>
                        {canManage ? (
                          <Link href={`/dashboard/channels/${channel.id}/edit`} className="text-slate-700 underline">
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
                    No channels available yet.
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
