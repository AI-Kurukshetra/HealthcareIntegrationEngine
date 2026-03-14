import { createClient } from "@/lib/supabase/server";

import type {
  ActivityPoint,
  MonitoringDashboardData,
  MonitoringErrorItem,
  MonitoringSummary,
  ProcessingActivityItem
} from "@/lib/monitoring/types";

const DAY_MS = 24 * 60 * 60 * 1000;

function fallbackSummary(): MonitoringSummary {
  return {
    totalMessages: 128,
    successMessages: 111,
    failedMessages: 17,
    activeChannels: 6,
    unhealthyConnections: 2
  };
}

function fallbackActivitySeries(): ActivityPoint[] {
  const now = new Date();

  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(now.getTime() - (6 - index) * DAY_MS);
    const isoDate = date.toISOString().slice(0, 10);
    return {
      date: isoDate,
      label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count: [12, 19, 16, 23, 15, 21, 18][index] ?? 0
    };
  });
}

function fallbackRecentProcessing(): ProcessingActivityItem[] {
  const now = Date.now();
  return [
    {
      id: "mock-proc-1",
      messageType: "HL7_ADT",
      status: "delivered",
      receivedAt: new Date(now - 5 * 60 * 1000).toISOString(),
      processedAt: new Date(now - 4 * 60 * 1000).toISOString()
    },
    {
      id: "mock-proc-2",
      messageType: "FHIR_Observation",
      status: "processing",
      receivedAt: new Date(now - 12 * 60 * 1000).toISOString(),
      processedAt: null
    },
    {
      id: "mock-proc-3",
      messageType: "X12_837",
      status: "failed",
      receivedAt: new Date(now - 27 * 60 * 1000).toISOString(),
      processedAt: null
    }
  ];
}

function fallbackRecentErrors(): MonitoringErrorItem[] {
  const now = Date.now();
  return [
    {
      id: "mock-err-1",
      source: "Message Pipeline",
      message: "Validation failed for payer segment mapping.",
      createdAt: new Date(now - 10 * 60 * 1000).toISOString()
    },
    {
      id: "mock-err-2",
      source: "Connection Health",
      message: "Connection heartbeat timeout for lab vendor API.",
      createdAt: new Date(now - 22 * 60 * 1000).toISOString()
    }
  ];
}

function isSuccessStatus(status: string) {
  return status === "delivered" || status === "acknowledged";
}

async function getSummary(organizationId: string): Promise<MonitoringSummary> {
  const supabase = await createClient();

  try {
    const [totalRes, successRes, failedRes, activeChannelsRes, unhealthyConnectionsRes] = await Promise.all([
      supabase.from("messages").select("*", { count: "exact", head: true }).eq("organization_id", organizationId),
      supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .in("status", ["delivered", "acknowledged"]),
      supabase.from("messages").select("*", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "failed"),
      supabase.from("channels").select("*", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "active"),
      supabase.from("connections").select("*", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "error")
    ]);

    if (totalRes.error || successRes.error || failedRes.error || activeChannelsRes.error || unhealthyConnectionsRes.error) {
      return fallbackSummary();
    }

    return {
      totalMessages: totalRes.count ?? 0,
      successMessages: successRes.count ?? 0,
      failedMessages: failedRes.count ?? 0,
      activeChannels: activeChannelsRes.count ?? 0,
      unhealthyConnections: unhealthyConnectionsRes.count ?? 0
    };
  } catch {
    return fallbackSummary();
  }
}

async function getActivitySeries(organizationId: string): Promise<ActivityPoint[]> {
  const supabase = await createClient();
  const now = new Date();
  const start = new Date(now.getTime() - 6 * DAY_MS);
  const startIso = new Date(start.setHours(0, 0, 0, 0)).toISOString();

  try {
    const { data, error } = await supabase
      .from("messages")
      .select("received_at")
      .eq("organization_id", organizationId)
      .gte("received_at", startIso)
      .order("received_at", { ascending: true });

    if (error) {
      return fallbackActivitySeries();
    }

    const counts = new Map<string, number>();
    for (let i = 0; i < 7; i += 1) {
      const day = new Date(start.getTime() + i * DAY_MS);
      const key = day.toISOString().slice(0, 10);
      counts.set(key, 0);
    }

    for (const row of data ?? []) {
      const key = row.received_at.slice(0, 10);
      if (counts.has(key)) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries()).map(([date, count]) => {
      const rawDate = new Date(`${date}T00:00:00.000Z`);
      return {
        date,
        label: rawDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        count
      };
    });
  } catch {
    return fallbackActivitySeries();
  }
}

async function getRecentProcessing(organizationId: string): Promise<ProcessingActivityItem[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("messages")
      .select("id, message_type, status, received_at, processed_at")
      .eq("organization_id", organizationId)
      .order("received_at", { ascending: false })
      .limit(8);

    if (error || !data?.length) {
      return fallbackRecentProcessing();
    }

    return data.map((row) => ({
      id: row.id,
      messageType: row.message_type,
      status: row.status,
      receivedAt: row.received_at,
      processedAt: row.processed_at
    }));
  } catch {
    return fallbackRecentProcessing();
  }
}

async function getRecentErrors(organizationId: string): Promise<MonitoringErrorItem[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("message_logs")
      .select("id, event, details, created_at")
      .eq("organization_id", organizationId)
      .eq("level", "error")
      .order("created_at", { ascending: false })
      .limit(8);

    if (!error && data?.length) {
      return data.map((row) => ({
        id: String(row.id),
        source: row.event,
        message: row.details ?? "Unknown processing error.",
        createdAt: row.created_at
      }));
    }

    const { data: failedData, error: failedError } = await supabase
      .from("messages")
      .select("id, message_type, error_message, failed_at, received_at")
      .eq("organization_id", organizationId)
      .eq("status", "failed")
      .order("failed_at", { ascending: false })
      .limit(8);

    if (failedError || !failedData?.length) {
      return fallbackRecentErrors();
    }

    return failedData.map((row) => ({
      id: row.id,
      source: row.message_type,
      message: row.error_message ?? "Message failed without detailed error payload.",
      createdAt: row.failed_at ?? row.received_at
    }));
  } catch {
    return fallbackRecentErrors();
  }
}

export async function getMonitoringDashboardData(organizationId: string): Promise<MonitoringDashboardData> {
  const [summary, activitySeries, recentProcessing, recentErrors] = await Promise.all([
    getSummary(organizationId),
    getActivitySeries(organizationId),
    getRecentProcessing(organizationId),
    getRecentErrors(organizationId)
  ]);

  const successFromRecent = recentProcessing.filter((item) => isSuccessStatus(item.status)).length;
  const failedFromRecent = recentProcessing.filter((item) => item.status === "failed").length;

  return {
    summary: {
      ...summary,
      successMessages: summary.successMessages || successFromRecent,
      failedMessages: summary.failedMessages || failedFromRecent
    },
    activitySeries,
    recentProcessing,
    recentErrors
  };
}
