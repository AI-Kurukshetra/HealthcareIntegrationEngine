export interface MonitoringSummary {
  totalMessages: number;
  successMessages: number;
  failedMessages: number;
  activeChannels: number;
  unhealthyConnections: number;
}

export interface ProcessingActivityItem {
  id: string;
  messageType: string;
  status: string;
  receivedAt: string;
  processedAt: string | null;
}

export interface MonitoringErrorItem {
  id: string;
  source: string;
  message: string;
  createdAt: string;
}

export interface ActivityPoint {
  date: string;
  label: string;
  count: number;
}

export interface MonitoringDashboardData {
  summary: MonitoringSummary;
  activitySeries: ActivityPoint[];
  recentProcessing: ProcessingActivityItem[];
  recentErrors: MonitoringErrorItem[];
}
