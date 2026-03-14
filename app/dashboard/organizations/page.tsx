import Link from "next/link";

import { Card } from "@/components/ui/card";
import { adminRoles, hasRole } from "@/lib/auth/rbac";
import { requireRoleAccess } from "@/lib/auth/guards";
import { getOrganizationsForUser } from "@/lib/organizations/queries";

export const dynamic = "force-dynamic";

export default async function OrganizationsPage() {
  const context = await requireRoleAccess(adminRoles);
  const organizations = await getOrganizationsForUser(context.user.id);
  const canManageOrganizations = hasRole(context.membership?.role, adminRoles);

  return (
    <div className="grid gap-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Organizations</p>
            <h1 className="text-2xl font-semibold text-slate-900">Your organization workspaces</h1>
            <p className="mt-1 text-sm text-slate-600">
              Browse all organizations where you are an active member and jump to details quickly.
            </p>
          </div>

          {canManageOrganizations ? (
            <Link
              href="/dashboard/organizations/new"
              className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium !text-white hover:bg-slate-700"
            >
              Create organization
            </Link>
          ) : null}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 font-medium text-slate-600">Slug</th>
                <th className="px-4 py-3 font-medium text-slate-600">Your role</th>
                <th className="px-4 py-3 font-medium text-slate-600">Members</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {organizations.length ? (
                organizations.map((item) => (
                  <tr key={item.organization.id}>
                    <td className="px-4 py-3 text-slate-900">{item.organization.name}</td>
                    <td className="px-4 py-3 text-slate-600">{item.organization.slug}</td>
                    <td className="px-4 py-3 capitalize text-slate-900">{item.myRole}</td>
                    <td className="px-4 py-3 text-slate-900">{item.memberCount}</td>
                    <td className="px-4 py-3 capitalize text-slate-900">{item.organization.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-3">
                        <Link href={`/dashboard/organizations/${item.organization.id}`} className="text-slate-900 underline">
                          View
                        </Link>
                        {hasRole(item.myRole, adminRoles) ? (
                          <Link
                            href={`/dashboard/organizations/${item.organization.id}/edit`}
                            className="text-slate-700 underline"
                          >
                            Edit
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No organizations available for this account yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
