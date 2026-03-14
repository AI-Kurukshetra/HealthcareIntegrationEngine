"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Card } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { initialFormState, type FormState } from "@/lib/auth/form-state";
import type { ManagedOrganizationOption, UserRoleOption, UserStatusOption } from "@/lib/users/types";

interface UserFormProps {
  title: string;
  description: string;
  action: (_: FormState, formData: FormData) => Promise<FormState>;
  organizations: ManagedOrganizationOption[];
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
  mode: "create" | "edit";
  initialValues?: {
    full_name?: string;
    email?: string;
    role?: UserRoleOption;
    organization_id?: string;
    status?: UserStatusOption;
  };
}

export function UserForm({
  title,
  description,
  action,
  organizations,
  submitLabel,
  pendingLabel,
  cancelHref,
  mode,
  initialValues
}: UserFormProps) {
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <Card className="max-w-2xl space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-600">{description}</p>
      </div>

      <form action={formAction} className="space-y-4">
        <Field>
          <FieldLabel>Full name</FieldLabel>
          <Input name="full_name" placeholder="John Doe" defaultValue={state.values?.full_name ?? initialValues?.full_name ?? ""} required />
        </Field>

        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input
            name="email"
            type="email"
            placeholder="user@hospital.com"
            defaultValue={state.values?.email ?? initialValues?.email ?? ""}
            required
          />
        </Field>

        {mode === "create" ? (
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input
              name="password"
              type="password"
              placeholder="Minimum 8 characters"
              defaultValue={state.values?.password ?? ""}
              required
            />
          </Field>
        ) : null}

        <Field>
          <FieldLabel>Role</FieldLabel>
          <select
            name="role"
            defaultValue={state.values?.role ?? initialValues?.role ?? "user"}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          >
            <option value="admin">admin</option>
            <option value="user">user</option>
          </select>
        </Field>

        <Field>
          <FieldLabel>Organization</FieldLabel>
          <select
            name="organization_id"
            defaultValue={state.values?.organization_id ?? initialValues?.organization_id ?? organizations[0]?.id ?? ""}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            required
          >
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </Field>

        <Field>
          <FieldLabel>Status</FieldLabel>
          <select
            name="status"
            defaultValue={state.values?.status ?? initialValues?.status ?? "active"}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </Field>

        <FieldError>{state.error}</FieldError>

        <div className="flex flex-wrap gap-3">
          <AuthSubmitButton idleLabel={submitLabel} pendingLabel={pendingLabel} className="!w-auto !px-4 !text-white" />
          <Link
            href={cancelHref}
            className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
}
