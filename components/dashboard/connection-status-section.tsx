import { Card } from "@/components/ui/card";
import type { ConnectionItem } from "@/lib/dashboard/types";

interface ConnectionStatusSectionProps {
  items: ConnectionItem[];
}

function getStatusClasses(status: ConnectionItem["status"]) {
  if (status === "offline") {
    return "bg-rose-100 text-rose-700";
  }

  if (status === "degraded") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-emerald-100 text-emerald-700";
}

export function ConnectionStatusSection({ items }: ConnectionStatusSectionProps) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Connection status</h3>
        <p className="text-sm text-slate-500">{items.length} sources</p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">{item.name}</p>
              <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getStatusClasses(item.status)}`}>
                {item.status}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
              <span>Latency: {item.latencyMs === null ? "n/a" : `${item.latencyMs}ms`}</span>
              <span>{new Date(item.lastCheckedAt).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
