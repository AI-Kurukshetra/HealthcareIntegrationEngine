import Link from "next/link";

import { Card } from "@/components/ui/card";
import { requireRoleAccess } from "@/lib/auth/guards";
import { adminRoles } from "@/lib/auth/rbac";
import { setUserActiveStateAction } from "@/lib/users/actions";
import { getUsersForAdmin } from "@/lib/users/queries";

interface UsersPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export const dynamic = "force-dynamic";

function statusClasses(value: "active" | "inactive") {
  return value === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700";
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const context = await requireRoleAccess(adminRoles);
  const users = await getUsersForAdmin(context.user.id);

  const errorMap: Record<string, string> = {
    "cannot-deactivate-self": "You cannot deactivate your own account.",
    "owner-cannot-deactivate": "Owner account cannot be deactivated in this module.",
    "missing-service-role-key": "Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY)."
  };

  const errorMessage = params.error ? errorMap[params.error] : null;

  return (
    <div className="grid gap-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Admin</p>
            <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
            <p className="mt-1 text-sm text-slate-600">Create and manage sub users for your organizations.</p>
          </div>
          <Link
            href="/dashboard/users/new"
            className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium !text-white hover:bg-slate-700"
          >
            Create user
          </Link>
        </div>

        {errorMessage ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
        ) : null}
      </Card>

      <Card className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Full Name</th>
                <th className="px-4 py-3 font-medium text-slate-600">Email</th>
                <th className="px-4 py-3 font-medium text-slate-600">Role</th>
                <th className="px-4 py-3 font-medium text-slate-600">Organization</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">Created At</th>
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.length ? (
                users.map((user) => (
                  <tr key={user.memberId}>
                    <td className="px-4 py-3 text-slate-900">{user.fullName ?? "n/a"}</td>
                    <td className="px-4 py-3 text-slate-700">{user.email ?? "n/a"}</td>
                    <td className="px-4 py-3 capitalize text-slate-900">{user.role}</td>
                    <td className="px-4 py-3 text-slate-700">{user.organizationName}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${statusClasses(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{new Date(user.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link href={`/dashboard/users/${user.memberId}/edit`} className="text-slate-900 underline">
                          Edit
                        </Link>

                        {user.status === "active" ? (
                          <form action={setUserActiveStateAction.bind(null, user.memberId, "inactive")}>
                            <button type="submit" className="text-slate-700 underline">
                              Deactivate
                            </button>
                          </form>
                        ) : (
                          <form action={setUserActiveStateAction.bind(null, user.memberId, "active")}>
                            <button type="submit" className="text-slate-700 underline">
                              Activate
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No users found for your manageable organizations.
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
