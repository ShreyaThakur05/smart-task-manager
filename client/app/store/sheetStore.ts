import { create } from 'zustand'
import { useAuthStore } from './authStore'
import { supabase } from '../lib/supabase'

interface Sheet {
  id: string
  name: string
  color: string
  icon: string
  created_at: string
  user_id?: string
}

interface SheetState {
  sheets: Sheet[]
  activeSheetId: string
  
  addSheet: (name: string, color?: string, icon?: string) => Promise<void>
  deleteSheet: (id: string) => Promise<void>
  updateSheet: (id: string, updates: Partial<Sheet>) => Promise<void>
  setActiveSheet: (id: string) => void
  getActiveSheet: () => Sheet | null
  loadSheets: () => Promise<void>
}

const defaultSheets: Sheet[] = [
  { id: 'professional', name: 'Professional', color: 'blue', icon: '💼', created_at: new Date().toISOString() },
  { id: 'personal', name: 'Personal', color: 'green', icon: '🏠', created_at: new Date().toISOString() }
]

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'sheet-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

export const useSheetStore = create<SheetState>()(
  (set, get) => ({
    sheets: defaultSheets,
    activeSheetId: 'professional',

    addSheet: async (name, color = 'purple', icon = '📋') => {
      const { user } = useAuthStore.getState()
      if (!user) return

      const newSheet: Sheet = {
        id: generateId(),
        name: name.trim(),
        color,
        icon,
        user_id: user.id,
        created_at: new Date().toISOString()
      }

      try {
        const { error } = await supabase
          .from('sheets')
          .insert([{
            id: newSheet.id,
            user_id: newSheet.user_id,
            name: newSheet.name,
            color: newSheet.color,
            icon: newSheet.icon
          }])

        if (error) throw error
        set(state => ({ sheets: [...state.sheets, newSheet] }))
      } catch (error) {
        console.error('Failed to add sheet:', error)
      }
    },

    deleteSheet: async (id) => {
      const state = get()
      if (state.sheets.length <= 1) return
      if (['professional', 'personal'].includes(id)) return

      try {
        const { error } = await supabase
          .from('sheets')
          .delete()
          .eq('id', id)

        if (error) throw error

        set(state => {
          const newSheets = state.sheets.filter(sheet => sheet.id !== id)
          const newActiveId = state.activeSheetId === id ? newSheets[0].id : state.activeSheetId
          return { sheets: newSheets, activeSheetId: newActiveId }
        })
      } catch (error) {
        console.error('Failed to delete sheet:', error)
      }
    },

    updateSheet: async (id, updates) => {
      try {
        const { error } = await supabase
          .from('sheets')
          .update(updates)
          .eq('id', id)

        if (error) throw error

        set(state => ({
          sheets: state.sheets.map(sheet =>
            sheet.id === id ? { ...sheet, ...updates } : sheet
          )
        }))
      } catch (error) {
        console.error('Failed to update sheet:', error)
      }
    },

    setActiveSheet: (id) => set({ activeSheetId: id }),

    getActiveSheet: () => {
      const state = get()
      return state.sheets.find(sheet => sheet.id === state.activeSheetId) || null
    },

    loadSheets: async () => {
      const { user } = useAuthStore.getState()
      if (!user) return

      try {
        const { data: sheets } = await supabase
          .from('sheets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at')

        const customSheets = sheets || []
        const allSheets = [...defaultSheets, ...customSheets]

        set({ sheets: allSheets })
      } catch (error) {
        set({ sheets: defaultSheets })
      }
    }
  })
)