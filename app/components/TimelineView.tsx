'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle, AlertCircle, User, Flag } from 'lucide-react'
import { useTaskStore } from '../store/taskStore'
import { useSheetStore } from '../store/sheetStore'

export default function TimelineView() {
  const { getFilteredTasks } = useTaskStore()
  const { activeSheetId } = useSheetStore()
  
  const tasks = getFilteredTasks(activeSheetId)
  
  // Sort tasks by due date, then by start date, then by created date
  const sortedTasks = [...tasks].sort((a, b) => {
    const aDate = a.dueDate || a.startDate || a.created_at
    const bDate = b.dueDate || b.startDate || b.created_at
    return new Date(aDate).getTime() - new Date(bDate).getTime()
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'yet-to-start': return <Clock className="w-4 h-4 text-purple-500" />
      case 'in-progress': return <Clock className="w-4 h-4 text-blue-500" />
      case 'review': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'done': return <CheckCircle className="w-4 h-4 text-green-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50 dark:bg-red-900/10'
      case 'high': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10'
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
      case 'low': return 'border-l-green-500 bg-green-50 dark:bg-green-900/10'
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isOverdue = (task: any) => {
    if (!task.dueDate) return false
    return new Date(task.dueDate) < new Date() && task.status !== 'done'
  }

  const groupTasksByDate = () => {
    const groups: { [key: string]: any[] } = {}
    
    sortedTasks.forEach(task => {
      const date = task.dueDate || task.startDate || task.created_at
      const dateKey = new Date(date).toDateString()
      
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(task)
    })
    
    return groups
  }

  const taskGroups = groupTasksByDate()

  if (sortedTasks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No tasks in timeline
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Create some tasks with due dates to see them in the timeline view.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Timeline View</h2>
      
      <div className="space-y-6">
        {Object.entries(taskGroups).map(([dateKey, tasks]) => (
          <div key={dateKey} className="relative">
            {/* Date Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatDate(tasks[0].dueDate || tasks[0].startDate || tasks[0].created_at)}
              </h3>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            </div>

            {/* Tasks for this date */}
            <div className="ml-6 space-y-3">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border-l-4 p-4 rounded-lg ${getPriorityColor(task.priority)} ${
                    isOverdue(task) ? 'ring-2 ring-red-200 dark:ring-red-800' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(task.status)}
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </h4>
                        {isOverdue(task) && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-xs rounded-full">
                            Overdue
                          </span>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        {task.startDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Start: {formatDate(task.startDate)}</span>
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Due: {formatDate(task.dueDate)}</span>
                          </div>
                        )}
                        {task.assignee && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{task.assignee}</span>
                          </div>
                        )}
                      </div>

                      {task.labels && task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.labels.slice(0, 3).map((label, labelIndex) => (
                            <span
                              key={labelIndex}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded-full"
                            >
                              {label}
                            </span>
                          ))}
                          {task.labels.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                              +{task.labels.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <div className="flex items-center gap-1">
                        <Flag className={`w-3 h-3 ${
                          task.priority === 'urgent' ? 'text-red-500' :
                          task.priority === 'high' ? 'text-orange-500' :
                          task.priority === 'medium' ? 'text-yellow-500' :
                          'text-green-500'
                        }`} />
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}