import type { PropsWithChildren } from "react";

interface AuthShellProps extends PropsWithChildren {
  title: string;
  subtitle: string;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-10 lg:block">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-slate-300/35 blur-3xl" />

          <div className="relative space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Healthcare Integration</p>
            <h1 className="max-w-xl text-4xl font-semibold leading-tight text-slate-900">{title}</h1>
            <p className="max-w-xl text-base text-slate-600">{subtitle}</p>
          </div>
        </section>

        <section className="flex items-center justify-center">{children}</section>
      </div>
    </main>
  );
}
