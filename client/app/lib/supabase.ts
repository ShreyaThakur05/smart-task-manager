import { createClient } from '@supabase/supabase-js'
import { validateEnv } from './env'

const env = validateEnv()

if (!env.supabaseUrl || !env.supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.')
}

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

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