import { create } from 'zustand'
import { useAuthStore } from './authStore'
import { supabase } from '../lib/supabase'

interface Task {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'backlog' | 'in-progress' | 'review' | 'done'
  labels: string[]
  dueDate?: string
  startDate?: string
  assignee?: string
  created_at: string
  updated_at: string
  user_id?: string
  sheet_id?: string
  list_id?: string | null
  attachments?: string[]
  subtasks?: { id: string; text: string; completed: boolean }[]
  comments?: { id: string; text: string; author: string; timestamp: string }[]
}

export type { Task }

interface TaskState {
  tasks: Task[]
  lists: { id: string; title: string; user_id?: string; sheet_id?: string; created_at?: string }[]
  view: 'board' | 'list' | 'calendar' | 'timeline'
  selectedTask: Task | null
  
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>, sheetId?: string) => Promise<void>
  addList: (title: string, sheetId?: string) => Promise<void>
  deleteList: (id: string) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  moveTask: (id: string, newStatus: Task['status'], newListId?: string) => Promise<void>
  setView: (view: TaskState['view']) => void
  setSelectedTask: (task: Task | null) => void
  getFilteredTasks: (sheetId?: string) => Task[]
  getFilteredLists: (sheetId?: string) => { id: string; title: string; user_id?: string; sheet_id?: string; created_at?: string }[]
  loadData: () => Promise<void>
  saveData: () => Promise<void>
}

const defaultLists = [
  { id: 'backlog', title: '◦ Backlog' },
  { id: 'in-progress', title: '▶ In Progress' },
  { id: 'review', title: '◈ Review' },
  { id: 'done', title: '✓ Done' }
]

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  lists: defaultLists,
  view: 'board',
  selectedTask: null,

  addTask: async (taskData, sheetId) => {
    const { user } = useAuthStore.getState()
    if (!user) {
      throw new Error('You must be logged in to create tasks')
    }

    const { list_id, ...cleanTaskData } = taskData as any
    
    const newTask: Task = {
      ...cleanTaskData,
      id: crypto.randomUUID(),
      user_id: user.id,
      sheet_id: sheetId,
      list_id: list_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      attachments: cleanTaskData.attachments || []
    }
    
    // Auto-move based on start date
    if (newTask.startDate) {
      const startDate = new Date(newTask.startDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (startDate <= today) {
        newTask.status = 'in-progress'
      }
    }
    
    try {
      const { error } = await supabase
        .from('tasks')
        .insert([{
          id: newTask.id,
          user_id: newTask.user_id,
          title: newTask.title,
          description: newTask.description || null,
          priority: newTask.priority,
          status: newTask.status,
          labels: newTask.labels || [],
          due_date: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
          assignee: newTask.assignee || null,
          list_id: newTask.list_id,
          attachments: newTask.attachments || []
        }])
      
      if (error) {
        console.error('Supabase error:', error)
        throw new Error(`Database error: ${error.message}`)
      }
      
      set(state => ({ tasks: [newTask, ...state.tasks] }))
    } catch (error) {
      console.error('Add task failed:', error)
      throw error
    }
  },

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
          title: newList.title
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

  updateTask: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, ...updates, updated_at: new Date().toISOString() } : task
        )
      }))
    } catch (error) {
      console.error('Update task failed:', error)
    }
  },

  deleteTask: async (id) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask
      }))
    } catch (error) {
      throw error
    }
  },

  moveTask: async (id, newStatus, newListId) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          list_id: newListId || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, status: newStatus, list_id: newListId || null, updated_at: new Date().toISOString() } : task
        )
      }))
    } catch (error) {
      console.error('Move task failed:', error)
    }
  },

  setView: (view) => set({ view }),
  setSelectedTask: (task) => set({ selectedTask: task }),

  getFilteredTasks: (sheetId) => {
    const tasks = get().tasks
    return sheetId ? tasks.filter(task => task.sheet_id === sheetId) : tasks
  },
  getFilteredLists: (sheetId) => {
    const lists = get().lists
    const defaultLists = [
      { id: 'backlog', title: '◦ Backlog', sheet_id: sheetId },
      { id: 'in-progress', title: '▶ In Progress', sheet_id: sheetId },
      { id: 'review', title: '◈ Review', sheet_id: sheetId },
      { id: 'done', title: '✓ Done', sheet_id: sheetId }
    ]
    const customLists = sheetId ? lists.filter(list => list.sheet_id === sheetId) : lists
    return [...defaultLists, ...customLists]
  },

  loadData: async () => {
    const { user } = useAuthStore.getState()
    if (!user) return
    
    try {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      const { data: lists } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at')
      
      // Always include default lists, merge with custom lists
      const customLists = lists || []
      const allLists = [...defaultLists, ...customLists]
      
      set({ 
        tasks: (tasks || []).map(task => ({
          ...task,
          dueDate: task.due_date,
          list_id: task.list_id,
          labels: task.labels || [],
          attachments: task.attachments || []
        })), 
        lists: allLists
      })
    } catch (error) {
      // Silent fail - use default state with default lists
      set({ tasks: [], lists: defaultLists })
    }
  },

  saveData: async () => {
    // Auto-save is handled by individual operations in Supabase
  }
}))