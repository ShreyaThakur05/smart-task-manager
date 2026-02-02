import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
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
    loading: true,

    login: async (email: string, password: string) => {
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
        set({ user: data.user })
      }
    },

    register: async (email: string, password: string, name: string) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address')
      }
      
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password,
          options: {
            data: { 
              name: name.trim()
            }
          }
        })
        
        if (error) {
          throw new Error(error.message)
        }
        
        if (data.user) {
          set({ user: data.user })
        }
      } catch (err: any) {
        throw new Error(err.message || 'Registration failed. Please try again.')
      }
    },

    logout: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw new Error(error.message)
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