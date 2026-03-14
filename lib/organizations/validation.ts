import type { OrganizationRow } from "@/lib/types/database";

import type { OrganizationFormValues } from "@/lib/organizations/types";

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function slugify(value: string) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

export function validateOrganizationForm(rawValues: {
  name: string;
  status?: string;
}): { values: OrganizationFormValues; error: string | null } {
  const name = normalizeWhitespace(rawValues.name);
  const slug = slugify(name);
  const status = rawValues.status === "inactive" ? "inactive" : "active";

  if (!name) {
    return {
      values: { name, slug, status },
      error: "Organization name is required."
    };
  }

  if (name.length < 3) {
    return {
      values: { name, slug, status },
      error: "Organization name must be at least 3 characters."
    };
  }

  if (name.length > 80) {
    return {
      values: { name, slug, status },
      error: "Organization name must be 80 characters or fewer."
    };
  }

  if (!slug) {
    return {
      values: { name, slug, status },
      error: "Slug is required."
    };
  }

  if (!/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(slug)) {
    return {
      values: { name, slug, status },
      error: "Slug must contain only lowercase letters, numbers, and underscores."
    };
  }

  return {
    values: {
      name,
      slug,
      status: status as OrganizationRow["status"]
    },
    error: null
  };
}

export function getOrganizationErrorMessage(message?: string | null) {
  if (!message) {
    return "Something went wrong. Please try again.";
  }

  const normalized = message.toLowerCase();

  if (normalized.includes("organizations_slug_unique_idx") || normalized.includes("duplicate key")) {
    return "That organization slug is already in use. Choose a different slug.";
  }

  return message;
}
