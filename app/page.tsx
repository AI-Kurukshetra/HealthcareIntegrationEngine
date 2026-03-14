import { redirect } from "next/navigation";

import { getAuthContext } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const context = await getAuthContext();

  redirect(context ? "/dashboard" : "/login");
}
