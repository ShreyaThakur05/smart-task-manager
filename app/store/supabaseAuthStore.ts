import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,

      signUp: async (email: string, password: string, name: string) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name }
          }
        })
        
        if (error) throw error
        if (data.user) set({ user: data.user })
      },

      signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) throw error
        if (data.user) set({ user: data.user })
      },

      signOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        set({ user: null })
      },

      initialize: async () => {
        set({ loading: true })
        
        const { data: { session } } = await supabase.auth.getSession()
        set({ user: session?.user || null, loading: false })
        
        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
          set({ user: session?.user || null, loading: false })
        })
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user })
    }
  )
)