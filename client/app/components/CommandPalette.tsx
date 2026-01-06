'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Filter, Calendar, List, LayoutGrid, Zap, Settings, LogOut } from 'lucide-react'
import { useTaskStore } from '../store/taskStore'
import { useAuthStore } from '../store/authStore'

interface Command {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action: () => void
  shortcut?: string
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { setView, addTask } = useTaskStore()
  const { logout } = useAuthStore()

  const commands: Command[] = [
    {
      id: 'new-task',
      title: 'Create New Task',
      description: 'Add a new task to your board',
      icon: <Plus className="w-4 h-4" />,
      action: () => {
        addTask({
          title: 'New Task',
          description: '',
          priority: 'medium',
          status: 'backlog',
          labels: [],
          subtasks: [],
          comments: [],
          attachments: []
        })
        onClose()
      },
      shortcut: '⌘N'
    },
    {
      id: 'board-view',
      title: 'Switch to Board View',
      description: 'View tasks in Kanban board layout',
      icon: <LayoutGrid className="w-4 h-4" />,
      action: () => {
        setView('board')
        onClose()
      },
      shortcut: '⌘1'
    },
    {
      id: 'list-view',
      title: 'Switch to List View',
      description: 'View tasks in list format',
      icon: <List className="w-4 h-4" />,
      action: () => {
        setView('list')
        onClose()
      },
      shortcut: '⌘2'
    },
    {
      id: 'calendar-view',
      title: 'Switch to Calendar View',
      description: 'View tasks by due date',
      icon: <Calendar className="w-4 h-4" />,
      action: () => {
        setView('calendar')
        onClose()
      },
      shortcut: '⌘3'
    },
    {
      id: 'logout',
      title: 'Sign Out',
      description: 'Sign out of your account',
      icon: <LogOut className="w-4 h-4" />,
      action: () => {
        logout()
        onClose()
      }
    }
  ]

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    command.description.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action()
          }
          break
        case 'Escape':
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredCommands, onClose])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[60] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 outline-none text-lg"
              />
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded border">
                ESC
              </kbd>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No commands found</p>
                </div>
              ) : (
                filteredCommands.map((command, index) => (
                  <motion.button
                    key={command.id}
                    onClick={command.action}
                    className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300">
                      {command.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {command.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {command.description}
                      </p>
                    </div>
                    {command.shortcut && (
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded border">
                        {command.shortcut}
                      </kbd>
                    )}
                  </motion.button>
                ))
              )}
            </div>

            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-white dark:bg-gray-700 rounded border text-xs">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-white dark:bg-gray-700 rounded border text-xs">↵</kbd>
                    Select
                  </span>
                </div>
                <span>Press ⌘K to open anytime</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}