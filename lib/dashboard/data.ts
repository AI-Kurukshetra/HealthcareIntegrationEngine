import { createClient } from "@/lib/supabase/server";
import type { AuthContext } from "@/lib/types/domain";

import type { ConnectionItem, DashboardData, ErrorItem, MessageItem, SummaryCardData } from "@/lib/dashboard/types";

function fallbackMessages(): MessageItem[] {
  return [
    {
      id: "mock-msg-1",
      channel: "HL7",
      sender: "ADT Gateway",
      preview: "ADT^A01 accepted for patient intake workflow.",
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      status: "delivered"
    },
    {
      id: "mock-msg-2",
      channel: "FHIR",
      sender: "Lab Connector",
      preview: "Observation bundle queued for sync.",
      createdAt: new Date(Date.now() - 1000 * 60 * 33).toISOString(),
      status: "queued"
    },
    {
      id: "mock-msg-3",
      channel: "X12",
      sender: "Claims Pipe",
      preview: "837 batch failed schema validation.",
      createdAt: new Date(Date.now() - 1000 * 60 * 68).toISOString(),
      status: "failed"
    }
  ];
}

function fallbackErrors(): ErrorItem[] {
  return [
    {
      id: "mock-err-1",
      source: "Claims Processor",
      message: "Invalid payer code mapping for claim segment NM1.",
      severity: "high",
      createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString()
    },
    {
      id: "mock-err-2",
      source: "FHIR Mapper",
      message: "Retrying bundle due to temporary upstream timeout.",
      severity: "medium",
      createdAt: new Date(Date.now() - 1000 * 60 * 41).toISOString()
    }
  ];
}

function fallbackConnections(organizationName: string): ConnectionItem[] {
  return [
    {
      id: "mock-conn-1",
      name: `${organizationName} EHR`,
      status: "online",
      latencyMs: 84,
      lastCheckedAt: new Date(Date.now() - 1000 * 40).toISOString()
    },
    {
      id: "mock-conn-2",
      name: "Lab Vendor API",
      status: "degraded",
      latencyMs: 420,
      lastCheckedAt: new Date(Date.now() - 1000 * 75).toISOString()
    },
    {
      id: "mock-conn-3",
      name: "Claims Clearinghouse",
      status: "offline",
      latencyMs: null,
      lastCheckedAt: new Date(Date.now() - 1000 * 160).toISOString()
    }
  ];
}

async function getSummaryCards(context: AuthContext): Promise<SummaryCardData[]> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("organization_members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", context.organization!.id)
    .eq("status", "active");

  return [
    {
      label: "Organization",
      value: context.organization!.name,
      description: "Current workspace scope."
    },
    {
      label: "Your role",
      value: context.membership!.role,
      description: "Permission level for protected actions."
    },
    {
      label: "Active members",
      value: String(count ?? 1),
      description: "Users currently active in this organization."
    },
    {
      label: "Connection health",
      value: context.organization!.status === "active" ? "Healthy" : "At risk",
      description: "Derived from current organization status."
    }
  ];
}

async function getRecentMessages(organizationId: string): Promise<MessageItem[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("messages")
      .select("id, direction, message_type, status, external_id, correlation_id, received_at")
      .eq("organization_id", organizationId)
      .order("received_at", { ascending: false })
      .limit(5);

    if (error || !Array.isArray(data) || data.length === 0) {
      return fallbackMessages();
    }

    return data.map((item) => ({
      id: item.id,
      channel: item.message_type,
      sender: item.direction === "inbound" ? "Inbound stream" : "Outbound stream",
      preview: item.external_id
        ? `External id: ${item.external_id}`
        : item.correlation_id
          ? `Correlation id: ${item.correlation_id}`
          : "No message metadata available.",
      createdAt: item.received_at,
      status: item.status === "failed" || item.status === "queued" ? item.status : "delivered"
    }));
  } catch {
    return fallbackMessages();
  }
}

async function getRecentErrors(organizationId: string): Promise<ErrorItem[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("message_logs")
      .select("id, event, details, level, created_at")
      .eq("organization_id", organizationId)
      .eq("level", "error")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error || !Array.isArray(data) || data.length === 0) {
      return fallbackErrors();
    }

    return data.map((item) => ({
      id: String(item.id),
      source: item.event,
      message: item.details ?? "Unknown error",
      severity: "high",
      createdAt: item.created_at
    }));
  } catch {
    return fallbackErrors();
  }
}

async function getConnections(organizationId: string, organizationName: string): Promise<ConnectionItem[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("connections")
      .select("id, name, status, last_heartbeat_at, last_error_at")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false })
      .limit(6);

    if (error || !Array.isArray(data) || data.length === 0) {
      return fallbackConnections(organizationName);
    }

    return data.map((item) => ({
      id: item.id,
      name: item.name,
      status: item.status === "active" ? "online" : item.status === "error" ? "offline" : "degraded",
      latencyMs: null,
      lastCheckedAt: item.last_heartbeat_at ?? item.last_error_at ?? new Date().toISOString()
    }));
  } catch {
    return fallbackConnections(organizationName);
  }
}

export async function getDashboardData(context: AuthContext): Promise<DashboardData> {
  const organizationId = context.organization!.id;
  const organizationName = context.organization!.name;

  const [summaryCards, recentMessages, recentErrors, connections] = await Promise.all([
    getSummaryCards(context),
    getRecentMessages(organizationId),
    getRecentErrors(organizationId),
    getConnections(organizationId, organizationName)
  ]);

  return {
    summaryCards,
    recentMessages,
    recentErrors,
    connections
  };
}
