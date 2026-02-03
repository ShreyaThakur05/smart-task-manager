export const validateEnv = () => {
  // Always return safe defaults during SSR/build
  if (typeof window === 'undefined') {
    return {
      supabaseUrl: '',
      supabaseAnonKey: '',
      geminiApiKey: '',
      hasGemini: false,
      hasValidSupabase: false
    }
  }

  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value || value.includes('your_') || value.includes('here'))
    .map(([key]) => key)

  const hasValidSupabase = missing.length === 0

  if (!hasValidSupabase) {
    console.warn('⚠️ Supabase not configured. Using mock authentication.')
  }

  return {
    supabaseUrl: requiredVars.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: requiredVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    hasGemini: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    hasValidSupabase
  }
}