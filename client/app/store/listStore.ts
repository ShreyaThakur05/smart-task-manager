import { create } from 'zustand'
import { useAuthStore } from './authStore'
import { supabase } from '../lib/supabase'

interface List {
  id: string
  title: string
  user_id?: string
  sheet_id?: string
  created_at?: string
}

interface ListState {
  lists: List[]
  addList: (title: string, sheetId?: string) => Promise<void>
  deleteList: (id: string) => Promise<void>
  updateList: (id: string, updates: Partial<List>) => Promise<void>
  getFilteredLists: (sheetId?: string) => List[]
  loadLists: () => Promise<void>
}

const defaultLists = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' }
]

export const useListStore = create<ListState>((set, get) => ({
  lists: defaultLists,

  addList: async (title, sheetId) => {
    const { user } = useAuthStore.getState()
    if (!user) return

    const newList = { 
      id: crypto.randomUUID(), 
      title: title.trim(),
      user_id: user.id,
      sheet_id: sheetId,
      created_at: new Date().toISOString()
    }
    
    try {
      const { error } = await supabase
        .from('lists')
        .insert([{
          id: newList.id,
          user_id: newList.user_id,
          title: newList.title,
          sheet_id: newList.sheet_id
        }])
      
      if (error) throw error
      
      set(state => ({ lists: [...state.lists, newList] }))
    } catch (error) {
      throw error
    }
  },

  deleteList: async (id) => {
    const defaultIds = ['backlog', 'in-progress', 'review', 'done']
    if (defaultIds.includes(id)) return
    
    try {
      const { error } = await supabase
        .from('lists')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      set(state => ({ lists: state.lists.filter(list => list.id !== id) }))
    } catch (error) {
      throw error
    }
  },

  updateList: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('lists')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
      
      set(state => ({
        lists: state.lists.map(list =>
          list.id === id ? { ...list, ...updates } : list
        )
      }))
    } catch (error) {
      throw error
    }
  },

  getFilteredLists: (sheetId) => {
    const lists = get().lists
    const filteredDefaults = defaultLists.map(list => ({ ...list, sheet_id: sheetId }))
    const customLists = sheetId ? lists.filter(list => list.sheet_id === sheetId) : lists.filter(list => !defaultLists.find(d => d.id === list.id))
    return [...filteredDefaults, ...customLists]
  },

  loadLists: async () => {
    const { user } = useAuthStore.getState()
    if (!user) return
    
    try {
      const { data: lists } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at')
      
      const customLists = lists || []
      const allLists = [...defaultLists, ...customLists]
      
      set({ lists: allLists })
    } catch (error) {
      set({ lists: defaultLists })
    }
  }
}))

export type { List }