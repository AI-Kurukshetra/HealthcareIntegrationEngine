export interface SummaryCardData {
  label: string;
  value: string;
  description: string;
}

export interface MessageItem {
  id: string;
  channel: string;
  sender: string;
  preview: string;
  createdAt: string;
  status: "delivered" | "queued" | "failed";
}

export interface ErrorItem {
  id: string;
  source: string;
  message: string;
  severity: "low" | "medium" | "high";
  createdAt: string;
}

export interface ConnectionItem {
  id: string;
  name: string;
  status: "online" | "degraded" | "offline";
  latencyMs: number | null;
  lastCheckedAt: string;
}

export interface DashboardData {
  summaryCards: SummaryCardData[];
  recentMessages: MessageItem[];
  recentErrors: ErrorItem[];
  connections: ConnectionItem[];
}
