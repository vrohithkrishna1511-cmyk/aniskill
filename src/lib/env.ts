export interface EnvConfigStatus {
  hasSupabaseUrl: boolean;
  hasSupabasePublishableKey: boolean;
  hasSupabaseSecretKey: boolean;
  hasGeminiKey: boolean;
  hasNextAuthSecret: boolean;
  hasGoogleClientId: boolean;
  hasGoogleClientSecret: boolean;
  hasDatabaseUrl: boolean;
  isFullyConfigured: boolean;
}

export function checkEnvConfig(): EnvConfigStatus {
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const hasSupabasePublishableKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim());
  const hasSupabaseSecretKey = Boolean(process.env.SUPABASE_SECRET_KEY?.trim());
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY?.trim());
  const hasNextAuthSecret = Boolean(process.env.NEXTAUTH_SECRET?.trim());
  const hasGoogleClientId = Boolean(process.env.GOOGLE_CLIENT_ID?.trim());
  const hasGoogleClientSecret = Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim());
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

  const isFullyConfigured =
    hasSupabaseUrl &&
    hasSupabasePublishableKey &&
    hasSupabaseSecretKey &&
    hasGeminiKey &&
    hasNextAuthSecret &&
    hasGoogleClientId &&
    hasGoogleClientSecret &&
    hasDatabaseUrl;

  return {
    hasSupabaseUrl,
    hasSupabasePublishableKey,
    hasSupabaseSecretKey,
    hasGeminiKey,
    hasNextAuthSecret,
    hasGoogleClientId,
    hasGoogleClientSecret,
    hasDatabaseUrl,
    isFullyConfigured,
  };
}
