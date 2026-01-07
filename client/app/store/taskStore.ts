import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

export const useTaskStore = create<TaskState>()(persist(
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
    },

    addList: async (title) => {
      const newList = {
        id: title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        title
      }
      
      set(state => ({ lists: [...state.lists, newList] }))
    },

    deleteList: async (id) => {
      set(state => ({ lists: state.lists.filter(list => list.id !== id) }))
    },

    updateTask: async (id, updates) => {
      const updatedTask = { ...updates, updatedAt: new Date().toISOString() }
      
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, ...updatedTask } : task
        )
      }))
    },

    deleteTask: async (id) => {
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask
      }))
    },

    loadData: async () => {
      const { lists } = get()
      if (lists.length === 0) {
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
  }),
  {
    name: 'task-store',
    partialize: (state) => ({ tasks: state.tasks, lists: state.lists })
  }
))