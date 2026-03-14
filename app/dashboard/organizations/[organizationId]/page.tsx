import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { Card } from "@/components/ui/card";
import { adminRoles, hasRole, ownerRoles } from "@/lib/auth/rbac";
import { requireRoleAccess } from "@/lib/auth/guards";
import {
  deleteOrganizationAction,
  removeOrganizationMemberAction,
  updateOrganizationMemberAction
} from "@/lib/organizations/actions";
import { getOrganizationDetailsForUser } from "@/lib/organizations/queries";

interface OrganizationDetailsPageProps {
  params: Promise<{
    organizationId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
}

const ORGANIZATION_ERROR_MESSAGES: Record<string, string> = {
  "invalid-member-input": "Member update input is invalid.",
  forbidden: "You do not have permission for this action.",
  "member-not-found": "Member not found.",
  "cannot-edit-self": "You cannot edit your own member role/status here.",
  "cannot-remove-self": "You cannot remove yourself from this screen.",
  "owner-only-change": "Only owners can modify owner membership.",
  "last-owner": "At least one active owner is required.",
  "owner-only-delete": "Only organization owners can delete organizations."
};

export const dynamic = "force-dynamic";

export default async function OrganizationDetailsPage({ params, searchParams }: OrganizationDetailsPageProps) {
  const { organizationId } = await params;
  const filters = await searchParams;
  const context = await requireRoleAccess(adminRoles);
  const details = await getOrganizationDetailsForUser(organizationId, context.user.id);

  if (!details) {
    notFound();
  }

  const canEdit = hasRole(details.myRole, adminRoles);
  const canDelete = hasRole(details.myRole, ownerRoles);
  const errorMessage = filters.error ? ORGANIZATION_ERROR_MESSAGES[filters.error] : null;

  return (
    <div className="grid gap-6">
      {errorMessage ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
      ) : null}

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Organization details</p>
            <h1 className="text-2xl font-semibold text-slate-900">{details.organization.name}</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            {canEdit ? (
              <Link
                href={`/dashboard/organizations/${details.organization.id}/edit`}
                className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium !text-white hover:bg-slate-700"
              >
                Edit organization
              </Link>
            ) : null}
            <Link
              href="/dashboard/organizations"
              className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Back to list
            </Link>
            {canDelete ? (
              <form action={deleteOrganizationAction.bind(null, details.organization.id)}>
                <ConfirmSubmitButton
                  confirmMessage="Delete this organization? This action cannot be undone."
                  className="inline-flex min-h-11 items-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                >
                  Delete organization
                </ConfirmSubmitButton>
              </form>
            ) : null}
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-slate-500">Slug</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{details.organization.slug}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Status</dt>
            <dd className="mt-1 text-sm font-medium capitalize text-slate-900">{details.organization.status}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Your role</dt>
            <dd className="mt-1 text-sm font-medium capitalize text-slate-900">{details.myRole}</dd>
          </div>
        </dl>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-sm text-slate-500">Members</p>
          <h2 className="text-xl font-semibold text-slate-900">Member listing</h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 font-medium text-slate-600">Email</th>
                <th className="px-4 py-3 font-medium text-slate-600">Role</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">Joined</th>
                {canEdit ? <th className="px-4 py-3 font-medium text-slate-600">Manage</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {details.members.map((member) => (
                <tr key={member.memberId}>
                  <td className="px-4 py-3 text-slate-900">{member.fullName ?? "Unnamed user"}</td>
                  <td className="px-4 py-3 text-slate-600">{member.email ?? "Unknown email"}</td>
                  <td className="px-4 py-3 capitalize text-slate-900">{member.role}</td>
                  <td className="px-4 py-3 capitalize text-slate-900">{member.status}</td>
                  <td className="px-4 py-3 text-slate-600">{new Date(member.joinedAt).toLocaleDateString()}</td>
                  {canEdit ? (
                    <td className="px-4 py-3">
                      {member.userId === context.user.id ? (
                        <p className="text-xs text-slate-500">Current user</p>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <form
                            action={updateOrganizationMemberAction.bind(null, details.organization.id, member.memberId)}
                            className="flex flex-wrap items-center gap-2"
                          >
                            <select
                              name="role"
                              defaultValue={member.role}
                              className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-900"
                            >
                              {canDelete ? <option value="owner">Owner</option> : null}
                              <option value="admin">Admin</option>
                              <option value="operator">Operator</option>
                              <option value="viewer">Viewer</option>
                            </select>
                            <select
                              name="status"
                              defaultValue={member.status}
                              className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-900"
                            >
                              <option value="active">Active</option>
                              <option value="invited">Invited</option>
                              <option value="suspended">Suspended</option>
                            </select>
                            <button
                              type="submit"
                              className="h-9 rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              Save
                            </button>
                          </form>

                          <form action={removeOrganizationMemberAction.bind(null, details.organization.id, member.memberId)}>
                            <ConfirmSubmitButton
                              confirmMessage="Remove this member from the organization?"
                              className="h-9 rounded-lg bg-rose-50 px-3 text-xs font-medium text-rose-700 hover:bg-rose-100"
                            >
                              Remove
                            </ConfirmSubmitButton>
                          </form>
                        </div>
                      )}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
