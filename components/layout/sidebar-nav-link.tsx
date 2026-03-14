"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface SidebarNavLinkProps {
  href: string;
  label: string;
}

function isActivePath(pathname: string, href: string) {
  if (pathname === href) {
    return true;
  }

  return pathname.startsWith(`${href}/`);
}

export function SidebarNavLink({ href, label }: SidebarNavLinkProps) {
  const pathname = usePathname();
  const isActive = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      className={cn(
        "rounded-xl border px-3 py-2 text-sm font-medium transition",
        isActive
          ? "border-slate-900 bg-slate-900 !text-white hover:!text-white"
          : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-white hover:text-slate-900"
      )}
    >
      {label}
    </Link>
  );
}
