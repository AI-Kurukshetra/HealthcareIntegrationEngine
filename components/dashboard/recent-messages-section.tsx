import { Card } from "@/components/ui/card";
import type { MessageItem } from "@/lib/dashboard/types";

interface RecentMessagesSectionProps {
  items: MessageItem[];
}

function getStatusClasses(status: MessageItem["status"]) {
  if (status === "failed") {
    return "bg-rose-50 text-rose-700";
  }

  if (status === "queued") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-emerald-50 text-emerald-700";
}

export function RecentMessagesSection({ items }: RecentMessagesSectionProps) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Recent messages</h3>
        <p className="text-sm text-slate-500">{items.length} items</p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">
                {item.channel} • {item.sender}
              </p>
              <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getStatusClasses(item.status)}`}>
                {item.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-700">{item.preview}</p>
            <p className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
