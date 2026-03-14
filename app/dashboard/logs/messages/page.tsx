import Link from "next/link";

import { LogFiltersForm } from "@/components/logs/log-filters-form";
import { LogLevelBadge } from "@/components/logs/log-level-badge";
import { Card } from "@/components/ui/card";
import { requireRoleAccess } from "@/lib/auth/guards";
import { adminRoles, hasRole, viewerRoles } from "@/lib/auth/rbac";
import { getMessageLogsForOrganization, getOrganizationUsers } from "@/lib/logs/queries";

interface MessageLogsPageProps {
  searchParams: Promise<{
    entity?: string;
    action?: string;
    user?: string;
    date_from?: string;
    date_to?: string;
    limit?: string;
  }>;
}

const MESSAGE_ENTITY_OPTIONS = [
  { value: "", label: "All entities" },
  { value: "message", label: "Message" },
  { value: "connection", label: "Connection" }
] as const;

export const dynamic = "force-dynamic";

export default async function MessageLogsPage({ searchParams }: MessageLogsPageProps) {
  const params = await searchParams;
  const context = await requireRoleAccess(viewerRoles);
  const canViewAuditLogs = hasRole(context.membership.role, adminRoles);
  const parsedLimit = params.limit ? Number.parseInt(params.limit, 10) : undefined;
  const limit = Number.isFinite(parsedLimit) ? parsedLimit : undefined;

  const [logs, users] = await Promise.all([
    getMessageLogsForOrganization(context.organization.id, {
      entity: params.entity || undefined,
      action: params.action || undefined,
      user: params.user || undefined,
      dateFrom: params.date_from || undefined,
      dateTo: params.date_to || undefined,
      limit
    }),
    getOrganizationUsers(context.organization.id)
  ]);

  return (
    <div className="grid gap-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Logs</p>
            <h1 className="text-2xl font-semibold text-slate-900">Message logs</h1>
            <p className="mt-1 text-sm text-slate-600">Read-only technical events for message and connection processing.</p>
          </div>
          {canViewAuditLogs ? (
            <Link
              href="/dashboard/logs/audit"
              className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              View audit logs
            </Link>
          ) : null}
        </div>

        <LogFiltersForm
          entityMode="select"
          entityOptions={MESSAGE_ENTITY_OPTIONS.map((option) => ({ ...option }))}
          entityValue={params.entity ?? ""}
          actionValue={params.action ?? ""}
          userValue={params.user ?? ""}
          dateFromValue={params.date_from ?? ""}
          dateToValue={params.date_to ?? ""}
          limitValue={String(limit ?? 100)}
          users={users.map((user) => ({ id: user.id, label: user.full_name ?? user.email }))}
        />
      </Card>

      <Card className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Created</th>
                <th className="px-4 py-3 font-medium text-slate-600">Level</th>
                <th className="px-4 py-3 font-medium text-slate-600">Entity</th>
                <th className="px-4 py-3 font-medium text-slate-600">Event</th>
                <th className="px-4 py-3 font-medium text-slate-600">User</th>
                <th className="px-4 py-3 font-medium text-slate-600">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {logs.length ? (
                logs.map((item) => (
                  <tr key={item.row.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{new Date(item.row.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <LogLevelBadge level={item.row.level} />
                    </td>
                    <td className="px-4 py-3 text-slate-900">
                      <p className="capitalize">{item.entityType}</p>
                      <p className="text-xs text-slate-500">{item.entityId}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-900">{item.row.event}</td>
                    <td className="px-4 py-3 text-slate-700">{item.userName ?? "system"}</td>
                    <td className="max-w-xl px-4 py-3 text-slate-600">{item.row.details ?? "n/a"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No message logs found for selected filters.
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
