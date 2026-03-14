const DUPLICATE_EMAIL_MESSAGES = ["already registered", "user already registered", "email already exists"];

export function getAuthErrorMessage(message?: string | null) {
  if (!message) {
    return "Something went wrong. Please try again.";
  }

  const normalized = message.toLowerCase();

  if (DUPLICATE_EMAIL_MESSAGES.some((entry) => normalized.includes(entry))) {
    return "That email is already in use. Sign in instead or use a different email.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }

  if (normalized.includes("password")) {
    return "Password must meet the minimum security requirements.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Email confirmation is enabled. Disable Confirm email in Supabase Auth settings for normal MVP login.";
  }

  return message;
}
