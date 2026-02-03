import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthUser {
  id: string
  email: string
  user_metadata: { name?: string }
}

interface AuthState {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  initialize: () => Promise<void>
  isLoggedIn: () => boolean
}

const getEnv = () => {
  if (typeof window === 'undefined') {
    return { hasValidSupabase: false }
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return {
    hasValidSupabase: !!(supabaseUrl && supabaseKey && !supabaseUrl.includes('your_')),
    supabaseUrl,
    supabaseKey
  }
}

export const useAuthStore = create<AuthState>()(persist(
  (set, get) => ({
    user: null,
    loading: false,

    login: async (email: string, password: string) => {
      const env = getEnv()
      
      if (!env.hasValidSupabase) {
        const mockUser: AuthUser = {
          id: 'mock-user-' + Date.now(),
          email: email.toLowerCase().trim(),
          user_metadata: { name: email.split('@')[0] }
        }
        set({ user: mockUser })
        return
      }

      const { supabase } = await import('../lib/supabase')
      if (!supabase) throw new Error('Supabase not configured')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      })
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials.')
        }
        throw new Error(error.message)
      }
      
      if (data.user) {
        set({ user: data.user as AuthUser })
      }
    },

    register: async (email: string, password: string, name: string) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address')
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long')
      }

      const env = getEnv()
      
      if (!env.hasValidSupabase) {
        const mockUser: AuthUser = {
          id: 'mock-user-' + Date.now(),
          email: email.toLowerCase().trim(),
          user_metadata: { name: name.trim() }
        }
        set({ user: mockUser })
        return
      }
      
      const { supabase } = await import('../lib/supabase')
      if (!supabase) throw new Error('Supabase not configured')
      
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: { name: name.trim() }
        }
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
      if (data.user) {
        set({ user: data.user as AuthUser })
      }
    },

    logout: async () => {
      const env = getEnv()
      
      if (!env.hasValidSupabase) {
        set({ user: null })
        return
      }

      const { supabase } = await import('../lib/supabase')
      if (!supabase) return
      
      const { error } = await supabase.auth.signOut()
      if (error) throw new Error(error.message)
      set({ user: null })
    },

    initialize: async () => {
      set({ loading: false })
      
      const env = getEnv()
      
      if (!env.hasValidSupabase) {
        return
      }

      try {
        const { supabase } = await import('../lib/supabase')
        if (!supabase) return
        
        const { data: { session } } = await supabase.auth.getSession()
        set({ user: session?.user as AuthUser || null })
        
        supabase.auth.onAuthStateChange((event, session) => {
          set({ user: session?.user as AuthUser || null })
        })
      } catch (error) {
        console.warn('Supabase initialization failed, using mock auth')
      }
    },

    isLoggedIn: () => {
      const state = get()
      return !!state.user
    }
  }),
  { 
    name: 'auth-store',
    partialize: (state) => ({ user: state.user })
  }
))