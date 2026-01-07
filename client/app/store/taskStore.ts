import { create } from 'zustand'
import { useAuthStore } from './authStore'

interface Task {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'backlog' | 'in-progress' | 'review' | 'done'
  assignee?: string
  dueDate?: string
  labels: string[]
  subtasks: { id: string; text: string; completed: boolean }[]
  comments: { id: string; text: string; author: string; timestamp: string }[]
  attachments: { id: string; name: string; url: string }[]
  listId?: string
  createdAt: string
  updatedAt: string
}

interface TaskState {
  tasks: Task[]
  lists: { id: string; title: string }[]
  filter: {
    status?: string
    priority?: string
    assignee?: string
    search: string
  }
  view: 'board' | 'list' | 'calendar' | 'timeline'
  selectedTask: Task | null
  
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  addList: (title: string) => Promise<void>
  deleteList: (id: string) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  loadData: () => Promise<void>
  saveData: () => Promise<void>
  moveTask: (id: string, newListId: string) => void
  setFilter: (filter: Partial<TaskState['filter']>) => void
  setView: (view: TaskState['view']) => void
  setSelectedTask: (task: Task | null) => void
  getFilteredTasks: () => Task[]
}

const apiCall = async (url: string, options: RequestInit = {}) => {
  const token = useAuthStore.getState().token
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  })
}

export const useTaskStore = create<TaskState>()(
  (set, get) => ({
    tasks: [],
    lists: [],
    filter: { search: '' },
    view: 'board',
    selectedTask: null,

    addTask: async (taskData) => {
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      set(state => ({ tasks: [...state.tasks, newTask] }))
      await get().saveData()
    },

    addList: async (title) => {
      const newList = {
        id: title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        title
      }
      
      set(state => ({ lists: [...state.lists, newList] }))
      await get().saveData()
    },

    deleteList: async (id) => {
      set(state => ({ lists: state.lists.filter(list => list.id !== id) }))
      await get().saveData()
    },

    updateTask: async (id, updates) => {
      const updatedTask = { ...updates, updatedAt: new Date().toISOString() }
      
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, ...updatedTask } : task
        )
      }))
      await get().saveData()
    },

    deleteTask: async (id) => {
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask
      }))
      await get().saveData()
    },

    loadData: async () => {
      try {
        const response = await apiCall('/api/data')
        if (response.ok) {
          const data = await response.json()
          set({ tasks: data.tasks, lists: data.lists })
        }
      } catch (error) {
        console.error('Failed to load data:', error)
        set({ 
          lists: [
            { id: 'backlog', title: 'Backlog' },
            { id: 'in-progress', title: 'In Progress' },
            { id: 'review', title: 'Review' },
            { id: 'done', title: 'Done' }
          ]
        })
      }
    },

    saveData: async () => {
      try {
        const { tasks, lists } = get()
        await apiCall('/api/data', {
          method: 'POST',
          body: JSON.stringify({ tasks, lists })
        })
      } catch (error) {
        console.error('Failed to save data:', error)
      }
    },

    moveTask: (id, newListId) => {
      const { tasks, lists } = get()
      const task = tasks.find(t => t.id === id)
      if (!task) return
      
      const targetList = lists.find(l => l.id === newListId)
      if (!targetList) return
      
      const updates: Partial<Task> = {
        status: ['backlog', 'in-progress', 'review', 'done'].includes(newListId) 
          ? newListId as Task['status']
          : 'backlog',
        listId: newListId
      }
      
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
        )
      }))
      
      get().updateTask(id, updates)
    },

    setFilter: (newFilter) => {
      set(state => ({ filter: { ...state.filter, ...newFilter } }))
    },

    setView: (view) => set({ view }),

    setSelectedTask: (task) => set({ selectedTask: task }),

    getFilteredTasks: () => {
      const { tasks, filter } = get()
      return tasks.filter(task => {
        const matchesSearch = !filter.search || 
          task.title.toLowerCase().includes(filter.search.toLowerCase()) ||
          task.description?.toLowerCase().includes(filter.search.toLowerCase())
        const matchesStatus = !filter.status || task.status === filter.status
        const matchesPriority = !filter.priority || task.priority === filter.priority
        const matchesAssignee = !filter.assignee || task.assignee === filter.assignee
        
        return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
      })
    }
  })
)