'use client'

import { useTaskStore } from './store/taskStore'
import { useAuthStore } from './store/authStore'
import { useSheetStore } from './store/sheetStore'
import AuthForm from './components/AuthForm'
import Board from './components/Board'
import TableView from './components/TableView'
import CalendarView from './components/CalendarView'
import DashboardView from './components/DashboardView'
import ThemeToggle from './components/ThemeToggle'
import TaskDetailModal from './components/TaskDetailModal'
import TaskCreateModal from './components/TaskCreateModal'
import AIAssistant from './components/AIAssistant'
import SheetTabs from './components/SheetTabs'
import { useState, useEffect } from 'react'
import { Plus, LayoutGrid, List, Calendar, BarChart3, Zap, LogOut, Bot, User } from 'lucide-react'

type Task = {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'yet-to-start' | 'backlog' | 'in-progress' | 'review' | 'done'
  labels: string[]
  dueDate?: string
  assignee?: string
  created_at: string
  updated_at: string
  user_id?: string
  list_id?: string | null
  subtasks?: { id: string; text: string; completed: boolean }[]
  comments?: { id: string; text: string; author: string; timestamp: string }[]
  attachments?: string[]
}

export default function Home() {
  const authStore = useAuthStore()
  const { activeSheetId, getActiveSheet } = useSheetStore()
  const { 
    tasks, 
    lists, 
    view, 
    setView, 
    selectedTask, 
    setSelectedTask, 
    getFilteredTasks, 
    getFilteredLists,
    addTask, 
    moveTask, 
    loadData
  } = useTaskStore()
  const [mounted, setMounted] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)

  const activeSheet = getActiveSheet()

  useEffect(() => {
    setMounted(true)
    authStore.initialize()
  }, [])

  useEffect(() => {
    if (mounted && authStore.user) {
      loadData()
      
      // Check and move tasks every minute
      const interval = setInterval(() => {
        useTaskStore.getState().checkAndMoveTasksByDate()
      }, 60000)
      
      return () => clearInterval(interval)
    }
  }, [mounted, authStore.user])

  if (!mounted || authStore.loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!authStore.user) {
    return <AuthForm />
  }

  const filteredTasks = getFilteredTasks(activeSheetId)
  const filteredLists = getFilteredLists(activeSheetId)
  const tasksByStatus = {
    'yet-to-start': filteredTasks.filter(t => t.status === 'yet-to-start'),
    backlog: filteredTasks.filter(t => t.status === 'backlog' && !t.list_id),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    review: filteredTasks.filter(t => t.status === 'review'),
    done: filteredTasks.filter(t => t.status === 'done')
  }

  const handleMoveTask = (taskId: string, newStatus: string, newListId?: string) => {
    moveTask(taskId, newStatus as Task['status'], newListId)
  }

  const boardData = {
    id: '1',
    title: activeSheet?.name || 'My Board',
    lists: filteredLists.map(list => {
      const isDefaultList = ['yet-to-start', 'backlog', 'in-progress', 'review', 'done'].includes(list.id)
      if (isDefaultList) {
        return {
          ...list,
          cards: tasksByStatus[list.id as keyof typeof tasksByStatus] || []
        }
      }
      return {
        ...list,
        cards: filteredTasks.filter(task => task.list_id === list.id)
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
      {/* Header - Fixed */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {activeSheet?.name || 'Smart Tasks'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <User className="w-4 h-4" />
              <span>{authStore.user?.user_metadata?.name || authStore.user?.email}</span>
            </div>
            <ThemeToggle />
            <button 
              onClick={authStore.logout} 
              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sheet Tabs */}
      <SheetTabs />

      {/* Toolbar - Fixed */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-16 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full font-medium">
                {filteredTasks.length} tasks
              </span>
              <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full font-medium">
                {tasksByStatus.done.length} completed
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                { key: 'board', icon: LayoutGrid, label: 'Board' },
                { key: 'list', icon: List, label: 'List' },
                { key: 'calendar', icon: Calendar, label: 'Calendar' },
                { key: 'timeline', icon: BarChart3, label: 'Timeline' }
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setView(key as any)}
                  className={`p-2 rounded-md transition-all duration-200 flex items-center gap-2 ${
                    view === key 
                      ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline text-sm">{label}</span>
                </button>
              ))}
            </div>
            
            {/* Action Buttons */}
            <button
              onClick={() => setShowTaskModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Task</span>
            </button>
            
            <button
              onClick={() => setShowAIAssistant(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">AI Create</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-full">
          {view === 'board' && <Board board={boardData} moveTask={handleMoveTask} />}
          {view === 'list' && <TableView />}
          {view === 'calendar' && <CalendarView />}
          {view === 'timeline' && <DashboardView />}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative overflow-hidden bg-gradient-to-br from-[#0b1020] via-[#0e1630] to-[#090d1a] text-gray-300">
        {/* Soft glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.15),transparent_40%)]" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Brand */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg">
                  ST
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Smart Tasks
                </h3>
              </div>
              <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                Designed to help you focus on what truly matters — clarity, flow, and meaningful progress.
              </p>
            </div>

            {/* Creator */}
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400">Crafted with care by</p>
              <h4 className="text-lg font-semibold text-white mt-1">
                Shreya Thakur
              </h4>
              <p className="text-sm text-gray-400 mt-1">
                Full Stack Developer
              </p>

              <div className="flex justify-center md:justify-end gap-6 mt-4">
                <a href="https://github.com/ShreyaThakur05" target="_blank" rel="noopener noreferrer" className="hover:text-white transition cursor-pointer">GitHub</a>
                <a href="https://www.linkedin.com/in/shreya-thakur-734097282/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition cursor-pointer">LinkedIn</a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row justify-between text-xs text-gray-400">
            <p>© 2026 Smart Tasks. All rights reserved.</p>
            <div className="flex gap-6 mt-2 md:mt-0">
              <span className="hover:text-white transition cursor-pointer">Privacy</span>
              <span className="hover:text-white transition cursor-pointer">Terms</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TaskCreateModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        defaultStatus="backlog"
        sheetId={activeSheetId}
      />
      
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
      
      {showAIAssistant && (
        <AIAssistant isOpen={showAIAssistant} onClose={() => setShowAIAssistant(false)} />
      )}
    </div>
  )
}