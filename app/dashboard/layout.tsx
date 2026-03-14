import type { PropsWithChildren } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { requireOrganizationAccess } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const context = await requireOrganizationAccess();

  return <AppShell context={context}>{children}</AppShell>;
}
