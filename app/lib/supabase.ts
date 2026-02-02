import { createClient } from '@supabase/supabase-js'
import { validateEnv } from './env'

const env = validateEnv()

if (!env.hasValidSupabase) {
  console.warn('⚠️ Supabase not configured properly. Authentication will use mock mode.')
}

export const supabase = env.hasValidSupabase ? createClient(env.supabaseUrl!, env.supabaseAnonKey!, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development'
  },
  global: {
    headers: {
      'apikey': env.supabaseAnonKey!
    }
  }
}) : null

// Database types
export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'backlog' | 'in-progress' | 'review' | 'done'
  labels: string[]
  due_date?: string
  assignee?: string
  created_at: string
  updated_at: string
}

export interface List {
  id: string
  user_id: string
  title: string
  created_at: string
}