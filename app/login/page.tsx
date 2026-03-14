import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/layout/auth-shell";

interface LoginPageProps {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Operate integrations with confidence."
      subtitle="Sign in to monitor channels, connections, messages, and audit activity across your healthcare workflows."
    >
      <LoginForm redirectTo={params.redirectTo} />
    </AuthShell>
  );
}
