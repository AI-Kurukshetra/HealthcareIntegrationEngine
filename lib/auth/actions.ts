"use server";

import { redirect } from "next/navigation";

import { getAuthErrorMessage } from "@/lib/auth/errors";
import type { FormState } from "@/lib/auth/form-state";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function getField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getLoginRedirectTarget(formData: FormData) {
  const redirectTo = getField(formData, "redirectTo");
  return redirectTo.startsWith("/") ? redirectTo : "/dashboard";
}

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  const email = getField(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = getLoginRedirectTarget(formData);

  if (!email || !password) {
    return {
      error: "Email and password are required.",
      values: {
        email
      }
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return {
      error: getAuthErrorMessage(error.message),
      values: {
        email
      }
    };
  }

  redirect(redirectTo);
}

export async function signupAction(_: FormState, formData: FormData): Promise<FormState> {
  const fullName = getField(formData, "fullName");
  const organizationName = getField(formData, "organizationName");
  const email = getField(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !organizationName || !email || !password) {
    return {
      error: "Full name, organization name, email, and password are required.",
      values: {
        email,
        fullName,
        organizationName
      }
    };
  }

  if (password.length < 8) {
    return {
      error: "Password must be at least 8 characters long.",
      values: {
        email,
        fullName,
        organizationName
      }
    };
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();

  if (!adminClient) {
    return {
      error:
        "Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) in .env.local. Add it and restart the app.",
      values: {
        email,
        fullName,
        organizationName
      }
    };
  }

  const { error: createUserError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName
    }
  });

  if (createUserError) {
    return {
      error: getAuthErrorMessage(createUserError.message),
      values: {
        email,
        fullName,
        organizationName
      }
    };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    return {
      error: getAuthErrorMessage(signInError.message),
      values: {
        email,
        fullName,
        organizationName
      }
    };
  }

  const { error: bootstrapError } = await supabase.rpc("bootstrap_new_user", {
    p_organization_name: organizationName
  });

  if (bootstrapError) {
    return {
      error: getAuthErrorMessage(bootstrapError.message),
      values: {
        email,
        fullName,
        organizationName
      }
    };
  }

  redirect("/dashboard");
}

export async function createOrganizationAction(_: FormState, formData: FormData): Promise<FormState> {
  const organizationName = getField(formData, "organizationName");

  if (!organizationName) {
    return {
      error: "Organization name is required.",
      values: {
        organizationName
      }
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("bootstrap_new_user", {
    p_organization_name: organizationName
  });

  if (error) {
    return {
      error: getAuthErrorMessage(error.message),
      values: {
        organizationName
      }
    };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
