import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      
      login: async (email: string, password: string) => {
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', email, password })
        })
        
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Login failed')
        }
        
        set({ user: data.user, token: data.token })
      },
      
      register: async (email: string, password: string, name: string) => {
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'register', email, password, name })
        })
        
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Registration failed')
        }
        
        set({ user: data.user, token: data.token })
      },
      
      logout: () => set({ user: null, token: null })
    }),
    {
      name: 'auth-store'
    }
  )
)