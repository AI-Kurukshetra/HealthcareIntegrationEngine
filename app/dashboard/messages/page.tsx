import Link from "next/link";

import { MessageStatusBadge } from "@/components/messages/message-status-badge";
import { Card } from "@/components/ui/card";
import { requireOrganizationAccess } from "@/lib/auth/guards";
import { adminRoles, hasRole } from "@/lib/auth/rbac";
import { MESSAGE_STATUS_OPTIONS } from "@/lib/messages/types";
import { getMessagesForOrganization } from "@/lib/messages/queries";
import type { MessageStatus } from "@/lib/types/database";

interface MessagesPageProps {
  searchParams: Promise<{
    status?: string;
    date_from?: string;
    date_to?: string;
    limit?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const params = await searchParams;
  const context = await requireOrganizationAccess();
  const canManage = hasRole(context.membership.role, adminRoles);
  const status = MESSAGE_STATUS_OPTIONS.includes(params.status as MessageStatus) ? (params.status as MessageStatus) : undefined;
  const dateFrom = params.date_from || undefined;
  const dateTo = params.date_to || undefined;
  const limit = params.limit ? Number.parseInt(params.limit, 10) : 50;
  const messages = await getMessagesForOrganization(context.organization.id, {
    status,
    dateFrom,
    dateTo,
    limit
  });

  return (
    <div className="grid gap-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Messages</p>
            <h1 className="text-2xl font-semibold text-slate-900">Message store</h1>
            <p className="mt-1 text-sm text-slate-600">Review ingested messages with status/date filtering.</p>
          </div>
          {canManage ? (
            <Link
              href="/dashboard/messages/new"
              className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium !text-white hover:bg-slate-700"
            >
              Store message
            </Link>
          ) : null}
        </div>

        <form className="grid gap-3 sm:grid-cols-4">
          <select
            name="status"
            defaultValue={status ?? ""}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          >
            <option value="">All statuses</option>
            {MESSAGE_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            name="date_from"
            type="date"
            defaultValue={dateFrom ?? ""}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          />
          <input
            name="date_to"
            type="date"
            defaultValue={dateTo ?? ""}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          />
          <input
            name="limit"
            type="number"
            min={1}
            max={200}
            defaultValue={String(limit)}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 sm:col-span-4 md:w-fit"
          >
            Apply filters
          </button>
        </form>
      </Card>

      <Card className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Received</th>
                <th className="px-4 py-3 font-medium text-slate-600">Channel</th>
                <th className="px-4 py-3 font-medium text-slate-600">Type</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">Payload preview</th>
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {messages.length ? (
                messages.map((message) => (
                  <tr key={message.id}>
                    <td className="px-4 py-3 text-slate-700">{new Date(message.receivedAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-700">{message.channelName ?? "n/a"}</td>
                    <td className="px-4 py-3 text-slate-900">{message.messageType}</td>
                    <td className="px-4 py-3">
                      <MessageStatusBadge status={message.status} />
                    </td>
                    <td className="px-4 py-3 max-w-sm truncate text-slate-600">{message.payloadPreview}</td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/messages/${message.id}`} className="text-slate-900 underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No messages found for selected filters.
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
