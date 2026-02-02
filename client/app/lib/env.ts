export const validateEnv = () => {
  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`)
  }

  return {
    supabaseUrl: requiredVars.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: requiredVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    hasGemini: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY
  }
}