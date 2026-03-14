import Link from "next/link";
import { notFound } from "next/navigation";

import { MessageStatusBadge } from "@/components/messages/message-status-badge";
import { Card } from "@/components/ui/card";
import { requireOrganizationAccess } from "@/lib/auth/guards";
import { getMessageDetails } from "@/lib/messages/queries";

interface MessageDetailsPageProps {
  params: Promise<{
    messageId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function MessageDetailsPage({ params }: MessageDetailsPageProps) {
  const { messageId } = await params;
  const context = await requireOrganizationAccess();
  const details = await getMessageDetails(messageId, context.organization.id);

  if (!details) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Message details</p>
            <h1 className="text-2xl font-semibold text-slate-900">{details.message.message_type}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <MessageStatusBadge status={details.message.status} />
            <Link
              href="/dashboard/messages"
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
            <dt className="text-sm text-slate-500">Direction</dt>
            <dd className="mt-1 capitalize text-sm text-slate-900">{details.message.direction}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Received at</dt>
            <dd className="mt-1 text-sm text-slate-900">{new Date(details.message.received_at).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Processed at</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {details.message.processed_at ? new Date(details.message.processed_at).toLocaleString() : "Not processed"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm text-slate-500">Error message</dt>
            <dd className="mt-1 text-sm text-slate-900">{details.message.error_message ?? "None"}</dd>
          </div>
        </dl>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Payload</h2>
        <pre className="max-h-[560px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800">
          {details.payloadPretty}
        </pre>
      </Card>
    </div>
  );
}
