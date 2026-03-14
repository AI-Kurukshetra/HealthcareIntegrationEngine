import Link from "next/link";
import { notFound } from "next/navigation";

import { ConnectionStatusBadge } from "@/components/connections/connection-status-badge";
import { Card } from "@/components/ui/card";
import { setConnectionStatusAction } from "@/lib/connections/actions";
import { requireOrganizationAccess } from "@/lib/auth/guards";
import { adminRoles, hasRole } from "@/lib/auth/rbac";
import { getConnectionDetails } from "@/lib/connections/queries";

interface ConnectionDetailsPageProps {
  params: Promise<{
    connectionId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ConnectionDetailsPage({ params }: ConnectionDetailsPageProps) {
  const { connectionId } = await params;
  const context = await requireOrganizationAccess();
  const canManage = hasRole(context.membership.role, adminRoles);
  const details = await getConnectionDetails(connectionId, context.organization.id);

  if (!details) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Connection details</p>
            <h1 className="text-2xl font-semibold text-slate-900">{details.connection.name}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {details.sourceSystem?.name ?? "Unknown source"} {"->"} {details.targetSystem?.name ?? "Unknown target"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ConnectionStatusBadge status={details.connection.status} />
            {canManage ? (
              <>
                <Link
                  href={`/dashboard/connections/${details.connection.id}/edit`}
                  className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium !text-white hover:bg-slate-700"
                >
                  Edit connection
                </Link>
                {details.connection.status !== "active" ? (
                  <form action={setConnectionStatusAction.bind(null, details.connection.id, "active")}>
                    <button
                      type="submit"
                      className="inline-flex min-h-11 items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      Resume
                    </button>
                  </form>
                ) : (
                  <form action={setConnectionStatusAction.bind(null, details.connection.id, "paused")}>
                    <button
                      type="submit"
                      className="inline-flex min-h-11 items-center rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                    >
                      Pause
                    </button>
                  </form>
                )}
              </>
            ) : null}
            <Link
              href="/dashboard/connections"
              className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Back to list
            </Link>
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Protocol type</dt>
            <dd className="mt-1 text-sm uppercase text-slate-900">{details.protocolType}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Endpoint</dt>
            <dd className="mt-1 break-all text-sm text-slate-900">{details.endpoint ?? "n/a"}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Health check interval</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {details.healthCheckIntervalMinutes ? `${details.healthCheckIntervalMinutes} minutes` : "n/a"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Credentials reference</dt>
            <dd className="mt-1 text-sm text-slate-900">{details.credentialsPlaceholder ?? "Not configured"}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Last heartbeat</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {details.connection.last_heartbeat_at ? new Date(details.connection.last_heartbeat_at).toLocaleString() : "n/a"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Last error</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {details.connection.last_error_at ? new Date(details.connection.last_error_at).toLocaleString() : "n/a"}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="space-y-2">
        <p className="text-sm font-medium text-slate-900">Security note</p>
        <p className="text-sm text-slate-600">
          Credentials are represented as reference placeholders only. Keep secrets in Supabase secrets or an Edge Function/Vault flow, not in frontend-readable fields.
        </p>
      </Card>
    </div>
  );
}
