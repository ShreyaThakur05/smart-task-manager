import { createClient } from '@supabase/supabase-js'

// Safe initialization for SSR
let supabaseClient: any = null

if (typeof window !== 'undefined') {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your_')) {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    })
  }
}

export const supabase = supabaseClient

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