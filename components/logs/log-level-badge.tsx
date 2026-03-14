import type { LogLevel } from "@/lib/types/database";

function getLevelClasses(level: LogLevel) {
  if (level === "error") {
    return "bg-rose-100 text-rose-700";
  }

  if (level === "warn") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-emerald-100 text-emerald-700";
}

export function LogLevelBadge({ level }: { level: LogLevel }) {
  return <span className={`rounded-full px-2 py-1 text-xs font-medium uppercase ${getLevelClasses(level)}`}>{level}</span>;
}
