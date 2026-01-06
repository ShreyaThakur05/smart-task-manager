'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useTaskStore } from '../store/taskStore'

export default function CalendarView() {
  const { tasks, setSelectedTask } = useTaskStore()
  const [currentDate, setCurrentDate] = useState(new Date())

  const today = new Date()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return taskDate.toDateString() === date.toDateString()
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const renderCalendarDays = () => {
    const days = []
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-32 bg-gray-50 dark:bg-gray-800/50" />
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const tasksForDay = getTasksForDate(date)
      const isToday = date.toDateString() === today.toDateString()
      const isPast = date < today && !isToday

      days.push(
        <motion.div
          key={day}
          whileHover={{ scale: 1.02 }}
          className={`h-32 border border-gray-200 dark:border-gray-700 p-2 cursor-pointer transition-colors ${
            isToday 
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' 
              : isPast 
                ? 'bg-gray-50 dark:bg-gray-800/50' 
                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${
              isToday 
                ? 'text-blue-600 dark:text-blue-400' 
                : isPast 
                  ? 'text-gray-400 dark:text-gray-500' 
                  : 'text-gray-900 dark:text-white'
            }`}>
              {day}
            </span>
            {tasksForDay.length > 0 && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 rounded">
                {tasksForDay.length}
              </span>
            )}
          </div>
          
          <div className="space-y-1 overflow-hidden">
            {tasksForDay.slice(0, 3).map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedTask(task)
                }}
                className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                  task.status === 'done' 
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 line-through' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                  <span className="truncate">{task.title}</span>
                </div>
              </motion.div>
            ))}
            {tasksForDay.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                +{tasksForDay.length - 3} more
              </div>
            )}
          </div>
        </motion.div>
      )
    }

    return days
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Event</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="h-10 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Calendar Legend */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-gray-600 dark:text-gray-300">Urgent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span className="text-gray-600 dark:text-gray-300">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-gray-600 dark:text-gray-300">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-gray-600 dark:text-gray-300">Low</span>
          </div>
        </div>
      </div>
    </div>
  )
}