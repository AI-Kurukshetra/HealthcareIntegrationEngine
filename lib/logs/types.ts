import type { AuditLogRow, MessageLogRow } from "@/lib/types/database";

export interface LogFilters {
  entity?: string;
  action?: string;
  user?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export interface MessageLogListItem {
  row: MessageLogRow;
  userName: string | null;
  entityType: "message" | "connection";
  entityId: string;
}

export interface AuditLogListItem {
  row: AuditLogRow;
  userName: string | null;
}
