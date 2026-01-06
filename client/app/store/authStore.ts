import { create } from 'zustand'

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

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null,
  
  login: async (email: string, password: string) => {
    set({ 
      user: { id: Date.now().toString(), email, name: email.split('@')[0] }, 
      token: 'demo-token' 
    })
  },
  
  register: async (email: string, password: string, name: string) => {
    set({ 
      user: { id: Date.now().toString(), email, name }, 
      token: 'demo-token' 
    })
  },
  
  logout: () => set({ user: null, token: null })
}))