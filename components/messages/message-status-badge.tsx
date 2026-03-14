import type { MessageStatus } from "@/lib/types/database";

function classes(status: MessageStatus) {
  if (status === "failed") {
    return "bg-rose-100 text-rose-700";
  }

  if (status === "delivered" || status === "acknowledged") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "processing" || status === "queued" || status === "transformed") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-200 text-slate-700";
}

export function MessageStatusBadge({ status }: { status: MessageStatus }) {
  return <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${classes(status)}`}>{status}</span>;
}
