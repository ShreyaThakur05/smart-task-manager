import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Task {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'backlog' | 'in-progress' | 'review' | 'done'
  labels: string[]
  dueDate?: string
  assignee?: string
  created_at: string
  updated_at: string
  user_id?: string
  attachments?: string[]
  subtasks?: { id: string; text: string; completed: boolean }[]
  comments?: { id: string; text: string; author: string; timestamp: string }[]
}

interface TaskState {
  tasks: Task[]
  lists: { id: string; title: string; user_id?: string; created_at?: string }[]
  view: 'board' | 'list' | 'calendar' | 'timeline'
  selectedTask: Task | null
  
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>
  addList: (title: string) => Promise<void>
  deleteList: (id: string) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  moveTask: (id: string, newStatus: Task['status']) => Promise<void>
  setView: (view: TaskState['view']) => void
  setSelectedTask: (task: Task | null) => void
  getFilteredTasks: () => Task[]
  loadData: () => Promise<void>
  saveData: () => Promise<void>
}

const defaultLists = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' }
]

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

export const useTaskStore = create<TaskState>()(persist(
  (set, get) => ({
    tasks: [],
    lists: defaultLists,
    view: 'board',
    selectedTask: null,

    addTask: async (taskData) => {
      const newTask: Task = {
        ...taskData,
        id: generateId(),
        user_id: 'local-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        attachments: taskData.attachments || []
      }
      
      set(state => ({ tasks: [newTask, ...state.tasks] }))
    },

    addList: async (title) => {
      const newList = { 
        id: generateId(), 
        title: title.trim(),
        user_id: 'local-user',
        created_at: new Date().toISOString()
      }
      
      set(state => ({ lists: [...state.lists, newList] }))
    },

    deleteList: async (id) => {
      const defaultIds = ['backlog', 'in-progress', 'review', 'done']
      if (defaultIds.includes(id)) return
      
      set(state => ({ lists: state.lists.filter(list => list.id !== id) }))
    },

    updateTask: async (id, updates) => {
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, ...updates, updated_at: new Date().toISOString() } : task
        )
      }))
    },

    deleteTask: async (id) => {
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask
      }))
    },

    moveTask: async (id, newStatus) => {
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, status: newStatus, updated_at: new Date().toISOString() } : task
        )
      }))
    },

    setView: (view) => set({ view }),
    setSelectedTask: (task) => set({ selectedTask: task }),
    getFilteredTasks: () => get().tasks,
    loadData: async () => {},
    saveData: async () => {}
  }),
  {
    name: 'task-store'
  }
))