import Link from "next/link";

import { Card } from "@/components/ui/card";
import type { MonitoringErrorItem } from "@/lib/monitoring/types";

interface MonitoringRecentErrorsSectionProps {
  items: MonitoringErrorItem[];
}

export function MonitoringRecentErrorsSection({ items }: MonitoringRecentErrorsSectionProps) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Recent errors</h3>
        <Link href="/dashboard/logs/messages?action=error" className="text-sm text-slate-700 underline">
          View logs
        </Link>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
            <p className="text-sm font-semibold text-slate-900">{item.source}</p>
            <p className="mt-2 text-sm text-slate-700">{item.message}</p>
            <p className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
