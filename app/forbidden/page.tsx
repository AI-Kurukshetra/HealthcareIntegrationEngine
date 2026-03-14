import Link from "next/link";

import { AuthShell } from "@/components/layout/auth-shell";
import { Card } from "@/components/ui/card";

export default function ForbiddenPage() {
  return (
    <AuthShell
      title="Access is restricted."
      subtitle="Your current role does not allow this action. Ask your organization admin for updated permissions."
    >
      <Card className="w-full max-w-md space-y-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Access Restricted</p>
        <h1 className="text-2xl font-semibold text-slate-900">You do not have access to this page.</h1>
        <p className="text-sm text-slate-600">Your organization role does not allow this action.</p>
        <Link href="/dashboard" className="inline-flex justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium !text-white hover:!text-white">
          Return to dashboard
        </Link>
      </Card>
    </AuthShell>
  );
}
