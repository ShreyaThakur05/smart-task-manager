import { create } from 'zustand'
import { subscribeWithSelector, persist } from 'zustand/middleware'
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
  persist(
    subscribeWithSelector((set, get) => ({
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
      
      try {
        const response = await apiCall('/api/data', {
          method: 'POST',
          body: JSON.stringify({ type: 'task', data: newTask })
        })
        
        if (response.ok) {
          set(state => ({ tasks: [...state.tasks, newTask] }))
        } else {
          // Fallback: add to local state even if API fails
          console.warn('API call failed, adding task locally')
          set(state => ({ tasks: [...state.tasks, newTask] }))
        }
      } catch (error) {
        console.error('Failed to add task via API, adding locally:', error)
        // Fallback: add to local state
        set(state => ({ tasks: [...state.tasks, newTask] }))
      }
    },

    addList: async (title) => {
      const newList = {
        id: title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        title
      }
      
      // Add locally first
      set(state => ({ lists: [...state.lists, newList] }))
      
      // Try to sync to server
      try {
        const response = await apiCall('/api/data', {
          method: 'POST',
          body: JSON.stringify({ type: 'list', data: newList })
        })
        
        if (!response.ok) {
          console.warn('Failed to sync list creation to server')
        }
      } catch (error) {
        console.warn('Failed to sync list creation to server:', error)
      }
    },

    deleteList: async (id) => {
      // Delete locally first
      set(state => ({ lists: state.lists.filter(list => list.id !== id) }))
      
      // Try to sync to server
      try {
        const response = await apiCall('/api/data', {
          method: 'DELETE',
          body: JSON.stringify({ type: 'list', id })
        })
        
        if (!response.ok) {
          console.warn('Failed to sync list deletion to server')
        }
      } catch (error) {
        console.warn('Failed to sync list deletion to server:', error)
      }
    },

    updateTask: async (id, updates) => {
      const updatedTask = { ...updates, updatedAt: new Date().toISOString() }
      
      // Update locally first
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, ...updatedTask } : task
        )
      }))
      
      // Try to sync to server
      try {
        const response = await apiCall('/api/data', {
          method: 'PUT',
          body: JSON.stringify({ type: 'task', id, data: updatedTask })
        })
        
        if (!response.ok) {
          console.warn('Failed to sync task update to server')
        }
      } catch (error) {
        console.warn('Failed to sync task update to server:', error)
      }
    },

    deleteTask: async (id) => {
      // Delete locally first
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask
      }))
      
      // Try to sync to server
      try {
        const response = await apiCall('/api/data', {
          method: 'DELETE',
          body: JSON.stringify({ type: 'task', id })
        })
        
        if (!response.ok) {
          console.warn('Failed to sync task deletion to server')
        }
      } catch (error) {
        console.warn('Failed to sync task deletion to server:', error)
      }
    },

    loadData: async () => {
      const currentState = get()
      
      try {
        const response = await apiCall('/api/data')
        if (response.ok) {
          const serverData = await response.json()
          // Merge server data with local data, preferring newer items
          const mergedTasks = [...(serverData.tasks || []), ...currentState.tasks]
            .reduce((acc: Task[], task: Task) => {
              const existing = acc.find((t: Task) => t.id === task.id)
              if (!existing || (task.updatedAt && existing.updatedAt && new Date(task.updatedAt) > new Date(existing.updatedAt))) {
                return [...acc.filter((t: Task) => t.id !== task.id), task]
              }
              return acc
            }, [])
          
          const mergedLists = [...(serverData.lists || []), ...currentState.lists]
            .reduce((acc: { id: string; title: string }[], list: { id: string; title: string }) => {
              if (!acc.find((l: { id: string; title: string }) => l.id === list.id)) {
                return [...acc, list]
              }
              return acc
            }, [])
          
          set({ tasks: mergedTasks, lists: mergedLists })
        } else {
          // Use existing local data or defaults
          if (currentState.lists.length === 0) {
            set({ 
              lists: [
                { id: 'backlog', title: 'Backlog' },
                { id: 'in-progress', title: 'In Progress' },
                { id: 'review', title: 'Review' },
                { id: 'done', title: 'Done' }
              ]
            })
          }
        }
      } catch (error) {
        console.error('Failed to load data, using local/defaults:', error)
        // Use existing local data or set defaults
        if (currentState.lists.length === 0) {
          set({ 
            lists: [
              { id: 'backlog', title: 'Backlog' },
              { id: 'in-progress', title: 'In Progress' },
              { id: 'review', title: 'Review' },
              { id: 'done', title: 'Done' }
            ]
          })
        }
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
      
      // Update locally first
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
        )
      }))
      
      // Try to update via API (but don't fail if it doesn't work)
      get().updateTask(id, updates).catch(error => {
        console.warn('Failed to sync move to server:', error)
      })
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
  })),
  {
    name: 'task-store',
    partialize: (state) => ({
      tasks: state.tasks,
      lists: state.lists,
      view: state.view
    })
  }
)
)