import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Sheet {
  id: string
  name: string
  color: string
  created_at: string
}

interface SheetState {
  sheets: Sheet[]
  activeSheetId: string
  
  addSheet: (name: string, color?: string) => void
  deleteSheet: (id: string) => void
  updateSheet: (id: string, updates: Partial<Sheet>) => void
  setActiveSheet: (id: string) => void
  getActiveSheet: () => Sheet | null
}

const defaultSheets: Sheet[] = [
  { id: 'professional', name: 'Professional', color: 'blue', created_at: new Date().toISOString() },
  { id: 'personal', name: 'Personal', color: 'green', created_at: new Date().toISOString() }
]

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'sheet-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

export const useSheetStore = create<SheetState>()(persist(
  (set, get) => ({
    sheets: defaultSheets,
    activeSheetId: 'professional',

    addSheet: (name, color = 'purple') => {
      const newSheet: Sheet = {
        id: generateId(),
        name: name.trim(),
        color,
        created_at: new Date().toISOString()
      }
      set(state => ({ sheets: [...state.sheets, newSheet] }))
    },

    deleteSheet: (id) => {
      const state = get()
      if (state.sheets.length <= 1) return
      
      set(state => {
        const newSheets = state.sheets.filter(sheet => sheet.id !== id)
        const newActiveId = state.activeSheetId === id ? newSheets[0].id : state.activeSheetId
        return { sheets: newSheets, activeSheetId: newActiveId }
      })
    },

    updateSheet: (id, updates) => {
      set(state => ({
        sheets: state.sheets.map(sheet =>
          sheet.id === id ? { ...sheet, ...updates } : sheet
        )
      }))
    },

    setActiveSheet: (id) => set({ activeSheetId: id }),

    getActiveSheet: () => {
      const state = get()
      return state.sheets.find(sheet => sheet.id === state.activeSheetId) || null
    }
  }),
  {
    name: 'sheet-store'
  }
))