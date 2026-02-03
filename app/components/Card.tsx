'use client'

import { motion } from 'framer-motion'
import { Calendar, User, AlertCircle, CheckCircle2, MessageSquare, Paperclip, MoreHorizontal, Edit, Trash2, Copy, Archive, Flag } from 'lucide-react'
import { useState } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface CardProps {
  card: {
    id: string
    title: string
    description?: string
    priority?: string
    assignee?: string
    dueDate?: string
    labels?: string[]
    subtasks?: { id: string; text: string; completed: boolean }[]
    comments?: { id: string; text: string; author: string; timestamp: string }[]
    attachments?: string[]
    cover?: {
      type: 'color' | 'gradient'
      value: string
    }
  }
}

export default function Card({ card }: CardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showCardMenu, setShowCardMenu] = useState(false)
  const { setSelectedTask, deleteTask, updateTask } = useTaskStore()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-gradient-to-r from-red-500 to-pink-500'
      case 'high': return 'bg-gradient-to-r from-orange-500 to-amber-500'
      case 'medium': return 'bg-gradient-to-r from-yellow-400 to-orange-400'
      case 'low': return 'bg-gradient-to-r from-green-400 to-emerald-500'
      default: return 'bg-gradient-to-r from-gray-400 to-slate-500'
    }
  }

  const getCoverStyle = () => {
    if (!card.cover) return {}
    
    if (card.cover.type === 'gradient') {
      return { background: card.cover.value }
    }
    return { backgroundColor: card.cover.value }
  }

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date()
  const completedSubtasks = card.subtasks?.filter(st => st.completed).length || 0
  const totalSubtasks = card.subtasks?.length || 0

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => setSelectedTask(card as any)}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 group relative overflow-visible hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gradient-to-br hover:from-blue-50/30 hover:to-indigo-50/30 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10 ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Card Cover */}
      {card.cover && (
        <div 
          className="h-16 w-full rounded-t-lg"
          style={getCoverStyle()}
        />
      )}

      {/* Priority Indicator */}
      {card.priority && !card.cover && (
        <div className="absolute top-0 left-0 w-full h-1">
          <div className={`h-full w-full ${getPriorityColor(card.priority)} rounded-t-lg`} />
        </div>
      )}

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Header with Menu */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-5 line-clamp-2">
              {card.title}
            </h4>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="relative ml-2 z-10"
          >
            <button
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
              onClick={(e) => {
                e.stopPropagation()
                setShowCardMenu(!showCardMenu)
              }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {showCardMenu && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowCardMenu(false)
                  }}
                />
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 w-48 z-50 min-w-max">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTask(card as any)
                      setShowCardMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Card
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteTask(card.id)
                      setShowCardMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Card
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* Labels */}
        {card.labels && card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {card.labels.slice(0, 3).map((label, index) => {
              const colors = [
                'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200',
                'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200',
                'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200',
                'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-200',
                'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border-rose-200',
                'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border-indigo-200'
              ]
              return (
                <span
                  key={index}
                  className={`px-2.5 py-1 text-xs rounded-full font-medium border ${colors[index % colors.length]} dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800`}
                >
                  {label}
                </span>
              )
            })}
            {card.labels.length > 3 && (
              <span className="px-2.5 py-1 bg-gradient-to-r from-gray-50 to-slate-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600">
                +{card.labels.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Progress Bar for Subtasks */}
        {totalSubtasks > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {completedSubtasks}/{totalSubtasks} tasks
              </span>
            </div>
            <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 dark:bg-gray-700 rounded-full h-2 shadow-inner">
              <div
                className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          {/* Left side - Assignee */}
          <div className="flex items-center">
            {card.assignee && (
              <div className="w-7 h-7 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-lg border-2 border-white dark:border-gray-800 ring-2 ring-purple-100 dark:ring-purple-900">
                {card.assignee.split(' ').map(n => n[0]).join('')}
              </div>
            )}
          </div>
          
          {/* Right side - Metadata */}
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            {/* Comments */}
            {card.comments && card.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span className="text-xs">{card.comments.length}</span>
              </div>
            )}
            
            {/* Attachments */}
            {card.attachments && card.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                <span className="text-xs">{card.attachments.length}</span>
              </div>
            )}
            
            {/* Due Date */}
            {card.dueDate && (
              <div className={`flex items-center gap-1 ${
                isOverdue ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'
              }`}>
                <Calendar className="w-3 h-3" />
                <span className="text-xs">
                  {new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

    </motion.div>
  )
}