function getEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getOptionalEnv(name: "SUPABASE_SERVICE_ROLE_KEY" | "SUPABASE_SECRET_KEY") {
  const value = process.env[name]?.trim();
  return value ? value.replace(/^"(.*)"$/, "$1") : null;
}

export const env = {
  supabaseUrl: getEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabasePublishableKey: getEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  supabaseServiceRoleKey: getOptionalEnv("SUPABASE_SERVICE_ROLE_KEY") ?? getOptionalEnv("SUPABASE_SECRET_KEY")
};
