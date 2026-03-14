import { ActivityChart } from "@/components/monitoring/activity-chart";
import { MonitoringRecentErrorsSection } from "@/components/monitoring/recent-errors-section";
import { RecentProcessingSection } from "@/components/monitoring/recent-processing-section";
import { MonitoringSummaryCards } from "@/components/monitoring/summary-cards";
import { SuccessFailureChart } from "@/components/monitoring/success-failure-chart";
import { requireOrganizationAccess } from "@/lib/auth/guards";
import { getMonitoringDashboardData } from "@/lib/monitoring/data";

export const dynamic = "force-dynamic";

export default async function MonitoringDashboardPage() {
  const context = await requireOrganizationAccess();
  const data = await getMonitoringDashboardData(context.organization.id);

  return (
    <div className="grid gap-6">
      <section className="space-y-1">
        <p className="text-sm text-slate-500">Monitoring</p>
        <h1 className="text-2xl font-semibold text-slate-900">{context.organization.name}</h1>
        <p className="text-sm text-slate-600">MVP operational metrics, activity, and recent failures.</p>
      </section>

      <MonitoringSummaryCards summary={data.summary} />

      <section className="grid gap-6 xl:grid-cols-2">
        <SuccessFailureChart successCount={data.summary.successMessages} failedCount={data.summary.failedMessages} />
        <ActivityChart points={data.activitySeries} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <RecentProcessingSection items={data.recentProcessing} />
        <MonitoringRecentErrorsSection items={data.recentErrors} />
      </section>
    </div>
  );
}
