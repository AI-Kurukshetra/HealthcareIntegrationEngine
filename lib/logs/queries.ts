import { createClient } from "@/lib/supabase/server";
import type { AuditLogRow, MessageLogRow, ProfileRow } from "@/lib/types/database";

import type { AuditLogListItem, LogFilters, MessageLogListItem } from "@/lib/logs/types";

function boundedLimit(value: number | undefined) {
  const normalized = typeof value === "number" && Number.isFinite(value) ? value : 100;
  return Math.min(Math.max(normalized, 1), 300);
}

function userMap(profiles: ProfileRow[]) {
  return new Map(profiles.map((profile) => [profile.id, profile]));
}

export async function getOrganizationUsers(organizationId: string) {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });

  const userIds = (members ?? []).map((member) => member.user_id);
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("*").in("id", userIds)
    : { data: [] as ProfileRow[] };

  return (profiles ?? []) as ProfileRow[];
}

export async function getMessageLogsForOrganization(
  organizationId: string,
  filters: LogFilters = {}
): Promise<MessageLogListItem[]> {
  const supabase = await createClient();
  const limit = boundedLimit(filters.limit);

  let query = supabase
    .from("message_logs")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.user) {
    query = query.eq("logged_by", filters.user);
  }

  if (filters.action) {
    query = query.ilike("event", `%${filters.action}%`);
  }

  if (filters.dateFrom) {
    query = query.gte("created_at", `${filters.dateFrom}T00:00:00.000Z`);
  }

  if (filters.dateTo) {
    query = query.lte("created_at", `${filters.dateTo}T23:59:59.999Z`);
  }

  if (filters.entity === "message") {
    query = query.not("message_id", "is", null);
  }

  if (filters.entity === "connection") {
    query = query.not("connection_id", "is", null);
  }

  const { data } = await query;
  const rows = (data ?? []) as MessageLogRow[];
  const userIds = Array.from(new Set(rows.map((row) => row.logged_by).filter(Boolean))) as string[];
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("*").in("id", userIds)
    : { data: [] as ProfileRow[] };
  const profileMap = userMap((profiles ?? []) as ProfileRow[]);

  return rows.map((row) => {
    const isConnection = !!row.connection_id;
    const entityType = isConnection ? "connection" : "message";
    const entityId = isConnection ? (row.connection_id as string) : row.message_id;
    const profile = row.logged_by ? profileMap.get(row.logged_by) : null;

    return {
      row,
      userName: profile?.full_name ?? profile?.email ?? null,
      entityType,
      entityId
    };
  });
}

export async function getAuditLogsForOrganization(
  organizationId: string,
  filters: LogFilters = {}
): Promise<AuditLogListItem[]> {
  const supabase = await createClient();
  const limit = boundedLimit(filters.limit);

  let query = supabase
    .from("audit_logs")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.user) {
    query = query.eq("actor_user_id", filters.user);
  }

  if (filters.entity) {
    query = query.eq("entity_type", filters.entity);
  }

  if (filters.action) {
    query = query.ilike("action", `%${filters.action}%`);
  }

  if (filters.dateFrom) {
    query = query.gte("created_at", `${filters.dateFrom}T00:00:00.000Z`);
  }

  if (filters.dateTo) {
    query = query.lte("created_at", `${filters.dateTo}T23:59:59.999Z`);
  }

  const { data } = await query;
  const rows = (data ?? []) as AuditLogRow[];
  const userIds = Array.from(new Set(rows.map((row) => row.actor_user_id).filter(Boolean))) as string[];
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("*").in("id", userIds)
    : { data: [] as ProfileRow[] };
  const profileMap = userMap((profiles ?? []) as ProfileRow[]);

  return rows.map((row) => {
    const profile = row.actor_user_id ? profileMap.get(row.actor_user_id) : null;

    return {
      row,
      userName: profile?.full_name ?? profile?.email ?? null
    };
  });
}
