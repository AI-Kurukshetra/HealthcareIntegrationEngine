import type { UserFormValues, UserRoleOption, UserStatusOption } from "@/lib/users/types";

function normalize(value: string) {
  return value.trim();
}

function parseRole(value: string): UserRoleOption | null {
  if (value === "admin" || value === "user") {
    return value;
  }

  return null;
}

function parseStatus(value: string): UserStatusOption | null {
  if (value === "active" || value === "inactive") {
    return value;
  }

  return null;
}

export function validateCreateUserForm(rawValues: {
  full_name: string;
  email: string;
  password: string;
  role: string;
  organization_id: string;
  status: string;
}): { values: UserFormValues; error: string | null } {
  const fullName = normalize(rawValues.full_name);
  const email = normalize(rawValues.email).toLowerCase();
  const password = String(rawValues.password ?? "");
  const role = parseRole(rawValues.role);
  const organizationId = normalize(rawValues.organization_id);
  const status = parseStatus(rawValues.status);

  const fallback: UserFormValues = {
    full_name: fullName,
    email,
    password,
    role: role ?? "user",
    organization_id: organizationId,
    status: status ?? "active"
  };

  if (!fullName) {
    return { values: fallback, error: "Full name is required." };
  }

  if (!email) {
    return { values: fallback, error: "Email is required." };
  }

  if (password.length < 8) {
    return { values: fallback, error: "Password must be at least 8 characters long." };
  }

  if (!role) {
    return { values: fallback, error: "Role is invalid." };
  }

  if (!organizationId) {
    return { values: fallback, error: "Organization is required." };
  }

  if (!status) {
    return { values: fallback, error: "Status is invalid." };
  }

  return {
    values: {
      ...fallback,
      role,
      status
    },
    error: null
  };
}

export function validateUpdateUserForm(rawValues: {
  full_name: string;
  email: string;
  role: string;
  organization_id: string;
  status: string;
}): { values: Omit<UserFormValues, "password">; error: string | null } {
  const fullName = normalize(rawValues.full_name);
  const email = normalize(rawValues.email).toLowerCase();
  const role = parseRole(rawValues.role);
  const organizationId = normalize(rawValues.organization_id);
  const status = parseStatus(rawValues.status);

  const fallback: Omit<UserFormValues, "password"> = {
    full_name: fullName,
    email,
    role: role ?? "user",
    organization_id: organizationId,
    status: status ?? "active"
  };

  if (!fullName) {
    return { values: fallback, error: "Full name is required." };
  }

  if (!email) {
    return { values: fallback, error: "Email is required." };
  }

  if (!role) {
    return { values: fallback, error: "Role is invalid." };
  }

  if (!organizationId) {
    return { values: fallback, error: "Organization is required." };
  }

  if (!status) {
    return { values: fallback, error: "Status is invalid." };
  }

  return {
    values: {
      ...fallback,
      role,
      status
    },
    error: null
  };
}
