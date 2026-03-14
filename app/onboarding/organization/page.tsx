import { redirect } from "next/navigation";

import { OrganizationOnboardingForm } from "@/components/auth/organization-onboarding-form";
import { AuthShell } from "@/components/layout/auth-shell";
import { requireAuthenticatedUser } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function OrganizationOnboardingPage() {
  const context = await requireAuthenticatedUser();

  if (context.organization && context.membership) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Complete your organization setup."
      subtitle="Link your account to an organization so your permissions and dashboard scope can be applied."
    >
      <OrganizationOnboardingForm />
    </AuthShell>
  );
}
