'use client'

import { useTaskStore } from './store/taskStore'
import { useAuthStore } from './store/authStore'
import { useHydration } from './hooks/useHydration'
import AuthForm from './components/AuthForm'
import Board from './components/Board'
import TableView from './components/TableView'
import CalendarView from './components/CalendarView'
import DashboardView from './components/DashboardView'
import ThemeToggle from './components/ThemeToggle'
import TaskDetailModal from './components/TaskDetailModal'
import TaskCreateModal from './components/TaskCreateModal'
import AIAssistant from './components/AIAssistant'
import { useState, useEffect } from 'react'
import { Search, Filter, Plus, Bell, MoreHorizontal, LayoutGrid, List, Calendar, BarChart3, Zap, Command, LogOut, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const isHydrated = useHydration()
  const { user, logout } = useAuthStore()
  const { tasks, lists, view, setView, selectedTask, setSelectedTask, filter, setFilter, getFilteredTasks, addTask, addList, moveTask, loadData } = useTaskStore()
  const [mounted, setMounted] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [quickTaskTitle, setQuickTaskTitle] = useState('')

  // First effect: mount and rehydrate from storage
  useEffect(() => {
    setMounted(true)
  }, [])

  // Second effect: load data only after component is mounted, hydrated, and user is available
  useEffect(() => {
    if (isHydrated && mounted && user) {
      loadData() // Load data from MongoDB when user is authenticated
    }
  }, [isHydrated, mounted, user, loadData])

  // Third effect: global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        setShowQuickAdd(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleQuickAdd = () => {
    if (!quickTaskTitle.trim()) return
    
    addTask({
      title: quickTaskTitle,
      description: '',
      priority: 'medium',
      status: 'backlog',
      labels: [],
      subtasks: [],
      comments: [],
      attachments: []
    })
    
    setQuickTaskTitle('')
    setShowQuickAdd(false)
  }

  const filteredTasks = getFilteredTasks()
  const tasksByStatus = {
    backlog: filteredTasks.filter(t => t.status === 'backlog'),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    review: filteredTasks.filter(t => t.status === 'review'),
    done: filteredTasks.filter(t => t.status === 'done')
  }

  const boardData = {
    id: '1',
    title: 'My Board',
    lists: lists.map(list => {
      // For default lists, use status-based filtering
      if (['backlog', 'in-progress', 'review', 'done'].includes(list.id)) {
        const statusKey = list.id as keyof typeof tasksByStatus
        return {
          ...list,
          cards: tasksByStatus[statusKey] || []
        }
      }
      // For user-created lists, filter by listId
      return {
        ...list,
        cards: filteredTasks.filter(t => t.listId === list.id)
      }
    })
  }

  if (!isHydrated || !mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading workspace...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Smart Tasks</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Quick Add */}
            <AnimatePresence>
              {showQuickAdd && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-16 right-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-80 z-40"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Quick Add Task</h3>
                  <input
                    type="text"
                    placeholder="Task title..."
                    value={quickTaskTitle}
                    onChange={(e) => setQuickTaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleQuickAdd()}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleQuickAdd}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      Add Task
                    </button>
                    <button
                      onClick={() => setShowQuickAdd(false)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* User Menu */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
              <div className="relative">
                <button className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name?.charAt(0).toUpperCase()}
                </button>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {filteredTasks.length} tasks
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                {tasksByStatus.done.length} completed
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Switcher */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                { key: 'board', icon: LayoutGrid, label: 'Board' },
                { key: 'list', icon: List, label: 'Table' },
                { key: 'calendar', icon: Calendar, label: 'Calendar' },
                { key: 'timeline', icon: BarChart3, label: 'Dashboard' }
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setView(key as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    view === key
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
            
            {/* Theme Toggle */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </button>
              
              <button
                onClick={() => setShowAIAssistant(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg font-medium text-sm"
              >
                <Bot className="w-4 h-4" />
                <span>AI Create</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          {view === 'board' && <Board board={boardData} moveTask={moveTask} />}
          {view === 'list' && <TableView />}
          {view === 'calendar' && <CalendarView />}
          {view === 'timeline' && <DashboardView />}
        </div>
      </main>

      {/* Task Create Modal */}
      <TaskCreateModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        defaultStatus="backlog"
      />

      {/* AI Assistant */}
      <AIAssistant
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      {/* Global Click Handler */}
      <div
        className="fixed inset-0 pointer-events-none"
        onClick={() => {
          setShowQuickAdd(false)
        }}
      />
    </div>
  )
}