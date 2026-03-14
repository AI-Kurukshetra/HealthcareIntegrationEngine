import type { ConnectionStatus } from "@/lib/types/database";

function getStatusClasses(status: ConnectionStatus) {
  if (status === "active") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "paused" || status === "draft") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "error") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-slate-200 text-slate-700";
}

export function ConnectionStatusBadge({ status }: { status: ConnectionStatus }) {
  return <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getStatusClasses(status)}`}>{status}</span>;
}
