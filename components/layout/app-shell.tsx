import type { PropsWithChildren } from "react";

import { adminRoles, operatorRoles, viewerRoles } from "@/lib/auth/rbac";
import type { AuthContext } from "@/lib/types/domain";
import { hasRole } from "@/lib/auth/rbac";

import { LogoutForm } from "@/components/layout/logout-form";
import { SidebarNavLink } from "@/components/layout/sidebar-nav-link";

interface AppShellProps extends PropsWithChildren {
  context: AuthContext;
}

export function AppShell({ children, context }: AppShellProps) {
  const links = [
    { href: "/dashboard/monitoring", label: "Monitoring", visible: true },
    { href: "/dashboard/organizations", label: "Organization", visible: hasRole(context.membership?.role, adminRoles) },
    { href: "/dashboard/users", label: "Users", visible: hasRole(context.membership?.role, adminRoles) },
    { href: "/dashboard/systems", label: "Systems", visible: hasRole(context.membership?.role, viewerRoles) },
    { href: "/dashboard/connections", label: "Connections", visible: hasRole(context.membership?.role, viewerRoles) },
    { href: "/dashboard/channels", label: "Channels", visible: hasRole(context.membership?.role, viewerRoles) },
    { href: "/dashboard/transformations", label: "Transformations", visible: hasRole(context.membership?.role, viewerRoles) },
    { href: "/dashboard/messages", label: "Messages", visible: hasRole(context.membership?.role, viewerRoles) },
    { href: "/dashboard/logs/messages", label: "Message Logs", visible: hasRole(context.membership?.role, viewerRoles) },
    { href: "/dashboard/logs/audit", label: "Audit Logs", visible: hasRole(context.membership?.role, adminRoles) }
  ].filter((link) => link.visible);

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-[var(--line)] bg-gradient-to-b from-white to-slate-50/70 p-5 shadow-[0_20px_38px_-28px_rgba(15,23,42,0.5)]">
          <div className="space-y-1 border-b border-[var(--line)] pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Healthcare Integration</p>
            <h1 className="text-lg font-semibold text-slate-900">{context.organization?.name ?? "Workspace"}</h1>
            <p className="text-sm text-slate-600">{context.profile.email}</p>
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Navigation</p>

          <nav className="mt-3 grid gap-1.5">
            {links.map((link) => (
              <SidebarNavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>
        </aside>

        <div className="grid gap-6">
          <header className="flex flex-col justify-between gap-4 rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-6 py-5 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.45)] sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-slate-500">Signed in as</p>
              <h2 className="text-lg font-semibold text-slate-900">
                {context.profile.full_name ?? context.user.email}
              </h2>
              <p className="text-sm capitalize text-slate-600">{context.membership?.role ?? "unassigned"}</p>
            </div>

            <LogoutForm />
          </header>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
