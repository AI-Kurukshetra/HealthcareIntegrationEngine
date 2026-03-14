import { Card } from "@/components/ui/card";
import { requireRoleAccess } from "@/lib/auth/guards";
import { operatorRoles } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const context = await requireRoleAccess(operatorRoles);

  return (
    <Card className="space-y-4">
      <div>
        <p className="text-sm text-slate-500">Operator Access</p>
        <h1 className="text-2xl font-semibold text-slate-900">Operations workspace</h1>
      </div>

      <p className="text-sm text-slate-600">
        This page is available to <span className="font-medium text-slate-900">admin</span> and{" "}
        <span className="font-medium text-slate-900">operator</span> roles. Current role:{" "}
        <span className="font-medium capitalize text-slate-900">{context.membership.role}</span>.
      </p>
    </Card>
  );
}
