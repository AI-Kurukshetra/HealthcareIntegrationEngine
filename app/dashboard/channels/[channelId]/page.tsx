import Link from "next/link";
import { notFound } from "next/navigation";

import { ChannelActiveBadge } from "@/components/channels/channel-active-badge";
import { Card } from "@/components/ui/card";
import { adminRoles, hasRole } from "@/lib/auth/rbac";
import { requireOrganizationAccess } from "@/lib/auth/guards";
import { getChannelDetails } from "@/lib/channels/queries";

interface ChannelDetailsPageProps {
  params: Promise<{
    channelId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ChannelDetailsPage({ params }: ChannelDetailsPageProps) {
  const { channelId } = await params;
  const context = await requireOrganizationAccess();
  const canManage = hasRole(context.membership.role, adminRoles);
  const details = await getChannelDetails(channelId, context.organization.id);

  if (!details) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Channel details</p>
            <h1 className="text-2xl font-semibold text-slate-900">{details.channel.name}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ChannelActiveBadge isActive={details.isActive} />
            {canManage ? (
              <Link
                href={`/dashboard/channels/${details.channel.id}/edit`}
                className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium !text-white hover:bg-slate-700"
              >
                Edit channel
              </Link>
            ) : null}
            <Link
              href="/dashboard/channels"
              className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Back to list
            </Link>
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Source system</dt>
            <dd className="mt-1 text-sm text-slate-900">{details.sourceSystemName ?? "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Destination system</dt>
            <dd className="mt-1 text-sm text-slate-900">{details.destinationSystemName ?? "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Connection</dt>
            <dd className="mt-1 text-sm text-slate-900">{details.connectionName ?? "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Direction</dt>
            <dd className="mt-1 capitalize text-sm text-slate-900">{details.channel.direction}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm text-slate-500">Filtering rules</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-900">{details.filteringRules || "No rules configured."}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
