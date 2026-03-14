import { createClient } from "@/lib/supabase/server";
import type { Json, SystemRow } from "@/lib/types/database";

import type { SystemDetails, SystemListItem } from "@/lib/systems/types";

function readBaseUrl(config: Json): string | null {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return null;
  }

  const value = (config as Record<string, Json | undefined>).base_url;
  return typeof value === "string" ? value : null;
}

export async function getSystemsForOrganization(organizationId: string): Promise<SystemListItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("systems")
    .select("*")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  const rows = (data ?? []) as SystemRow[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.system_type,
    vendor: row.vendor,
    baseUrl: readBaseUrl(row.config),
    status: row.status,
    updatedAt: row.updated_at
  }));
}

export async function getSystemDetails(systemId: string, organizationId: string): Promise<SystemDetails | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("systems")
    .select("*")
    .eq("id", systemId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  const system = data as SystemRow;

  return {
    system,
    baseUrl: readBaseUrl(system.config),
    notes: system.description
  };
}
