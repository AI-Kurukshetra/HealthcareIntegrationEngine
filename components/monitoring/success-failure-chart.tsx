import { Card } from "@/components/ui/card";

interface SuccessFailureChartProps {
  successCount: number;
  failedCount: number;
}

export function SuccessFailureChart({ successCount, failedCount }: SuccessFailureChartProps) {
  const total = Math.max(successCount + failedCount, 1);
  const successPct = Math.round((successCount / total) * 100);
  const failedPct = Math.round((failedCount / total) * 100);

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Success vs failed</h3>
        <p className="text-sm text-slate-500">Simple ratio based on persisted message statuses.</p>
      </div>

      <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="flex h-full">
          <div className="bg-emerald-500" style={{ width: `${successPct}%` }} />
          <div className="bg-rose-500" style={{ width: `${failedPct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="font-medium text-emerald-700">Success</p>
          <p className="mt-1 text-xl font-semibold text-emerald-800">{successCount}</p>
          <p className="text-xs text-emerald-700">{successPct}%</p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
          <p className="font-medium text-rose-700">Failed</p>
          <p className="mt-1 text-xl font-semibold text-rose-800">{failedCount}</p>
          <p className="text-xs text-rose-700">{failedPct}%</p>
        </div>
      </div>
    </Card>
  );
}
