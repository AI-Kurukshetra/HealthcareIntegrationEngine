import { Card } from "@/components/ui/card";
import type { ErrorItem } from "@/lib/dashboard/types";

interface RecentErrorsSectionProps {
  items: ErrorItem[];
}

function getSeverityClasses(severity: ErrorItem["severity"]) {
  if (severity === "high") {
    return "bg-rose-100 text-rose-700";
  }

  if (severity === "medium") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-100 text-slate-700";
}

export function RecentErrorsSection({ items }: RecentErrorsSectionProps) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Recent errors</h3>
        <p className="text-sm text-slate-500">{items.length} items</p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">{item.source}</p>
              <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getSeverityClasses(item.severity)}`}>
                {item.severity}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-700">{item.message}</p>
            <p className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
