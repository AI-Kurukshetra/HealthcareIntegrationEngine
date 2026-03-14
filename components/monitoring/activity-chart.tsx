import { Card } from "@/components/ui/card";
import type { ActivityPoint } from "@/lib/monitoring/types";

interface ActivityChartProps {
  points: ActivityPoint[];
}

export function ActivityChart({ points }: ActivityChartProps) {
  const max = Math.max(...points.map((point) => point.count), 1);

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Recent processing activity</h3>
        <p className="text-sm text-slate-500">Messages received in the last 7 days.</p>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {points.map((point) => {
          const height = Math.max(Math.round((point.count / max) * 100), 6);
          return (
            <div key={point.date} className="flex flex-col items-center gap-2">
              <div className="flex h-28 w-full items-end">
                <div
                  className="w-full rounded-t-md bg-slate-900/80 transition hover:bg-slate-900"
                  style={{ height: `${height}%` }}
                  title={`${point.label}: ${point.count}`}
                />
              </div>
              <p className="text-xs text-slate-500">{point.label}</p>
              <p className="text-xs font-medium text-slate-700">{point.count}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
