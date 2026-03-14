import Link from "next/link";

import { Card } from "@/components/ui/card";
import type { ProcessingActivityItem } from "@/lib/monitoring/types";

interface RecentProcessingSectionProps {
  items: ProcessingActivityItem[];
}

function statusClasses(status: string) {
  if (status === "failed") {
    return "bg-rose-100 text-rose-700";
  }

  if (status === "processing" || status === "queued") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-emerald-100 text-emerald-700";
}

export function RecentProcessingSection({ items }: RecentProcessingSectionProps) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Recent processing activity</h3>
        <Link href="/dashboard/messages" className="text-sm text-slate-700 underline">
          View all
        </Link>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">{item.messageType}</p>
              <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${statusClasses(item.status)}`}>
                {item.status}
              </span>
            </div>
            <div className="mt-2 grid gap-1 text-xs text-slate-600">
              <p>Received: {new Date(item.receivedAt).toLocaleString()}</p>
              <p>Processed: {item.processedAt ? new Date(item.processedAt).toLocaleString() : "Pending"}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
