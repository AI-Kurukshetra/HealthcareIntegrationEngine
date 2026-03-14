import { SignupForm } from "@/components/auth/signup-form";
import { AuthShell } from "@/components/layout/auth-shell";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <AuthShell
      title="Launch your integration workspace."
      subtitle="Create your organization, set up your admin access, and start routing healthcare data in minutes."
    >
      <SignupForm />
    </AuthShell>
  );
}
