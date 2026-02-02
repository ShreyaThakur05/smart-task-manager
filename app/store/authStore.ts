import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { validateEnv } from '../lib/env'

const env = validateEnv()

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

export const useAuthStore = create<AuthState>()(persist(
  (set, get) => ({
    user: null,
    loading: false,

    login: async (email: string, password: string) => {
      if (!env.hasValidSupabase) {
        // Mock login
        const mockUser: AuthUser = {
          id: 'mock-user-' + Date.now(),
          email: email.toLowerCase().trim(),
          user_metadata: { name: email.split('@')[0] }
        }
        set({ user: mockUser })
        return
      }

      // Real Supabase login
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

      if (!env.hasValidSupabase) {
        // Mock registration
        const mockUser: AuthUser = {
          id: 'mock-user-' + Date.now(),
          email: email.toLowerCase().trim(),
          user_metadata: { name: name.trim() }
        }
        set({ user: mockUser })
        return
      }
      
      // Real Supabase registration
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