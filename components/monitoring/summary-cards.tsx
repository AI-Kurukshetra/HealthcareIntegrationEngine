import { Card } from "@/components/ui/card";
import type { MonitoringSummary } from "@/lib/monitoring/types";

interface MonitoringSummaryCardsProps {
  summary: MonitoringSummary;
}

export function MonitoringSummaryCards({ summary }: MonitoringSummaryCardsProps) {
  const items = [
    { label: "Total messages", value: summary.totalMessages, hint: "All-time organization volume." },
    { label: "Success messages", value: summary.successMessages, hint: "Delivered or acknowledged." },
    { label: "Failed messages", value: summary.failedMessages, hint: "Requires review and replay." },
    { label: "Active channels", value: summary.activeChannels, hint: "Channels in active state." },
    { label: "Unhealthy connections", value: summary.unhealthyConnections, hint: "Connections with error status." }
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label} className="space-y-2">
          <p className="text-sm text-slate-500">{item.label}</p>
          <p className="text-3xl font-semibold text-slate-900">{item.value}</p>
          <p className="text-xs text-slate-600">{item.hint}</p>
        </Card>
      ))}
    </section>
  );
}
