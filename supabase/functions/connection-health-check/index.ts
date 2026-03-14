import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

interface HealthCheckPayload {
  connection_id: string;
  success: boolean;
  error_message?: string;
}

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const token = req.headers.get("x-health-check-token");
  const expectedToken = Deno.env.get("CONNECTION_HEALTH_CHECK_TOKEN");

  if (!expectedToken || token !== expectedToken) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  let payload: HealthCheckPayload;

  try {
    payload = (await req.json()) as HealthCheckPayload;
  } catch {
    return jsonResponse(400, { error: "Invalid JSON payload" });
  }

  if (!payload.connection_id || typeof payload.success !== "boolean") {
    return jsonResponse(400, { error: "connection_id and success are required" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(500, { error: "Missing Supabase runtime env vars" });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const updates = payload.success
    ? {
        status: "active",
        last_heartbeat_at: new Date().toISOString(),
        last_error_at: null
      }
    : {
        status: "error",
        last_error_at: new Date().toISOString()
      };

  const { error } = await supabase.from("connections").update(updates).eq("id", payload.connection_id);

  if (error) {
    return jsonResponse(500, { error: error.message });
  }

  return jsonResponse(200, {
    ok: true,
    connection_id: payload.connection_id,
    status: payload.success ? "active" : "error",
    message: payload.success ? "Heartbeat updated" : payload.error_message ?? "Connection marked as error"
  });
});
